import configService from "../../config/config.service.js"
import jwt from "jsonwebtoken"
import crypto from "node:crypto"
import { Queries, models } from "../../db/index.js"
import { enums } from "../index.js"
import { ServerException, UnAuthorizedException } from "../exceptions/index.js"
import { exists, set, get } from "./../services/cache.service.js"
import { getUserKey } from "../../module/auth/auth.service.js"

export function getPrefixRevoke (userId){
  return `revokeToken::${userId}`
}

export function getRevokeKey (userId,jti){
  return `${getPrefixRevoke(userId)}::${jti}`
}


const getTokenSecretsForRole = (role) => {
  let secrets
  switch (role) {
    case enums.roleEnum.admin:
      secrets = { access: configService.ADMIN_ACCESS_SECRET_KEY, refresh: configService.ADMIN_REFRESH_SECRET_KEY }
      break

    case enums.roleEnum.user:
      secrets = { access: configService.USER_ACCESS_SECRET_KEY, refresh: configService.USER_REFRESH_SECRET_KEY }
      break

    default:
      ServerException("Unhandled role")
  }
  return secrets
}


export const createTokens = ({ userId, issuer, role = enums.roleEnum.user }) => {
  let secrets = getTokenSecretsForRole(role)
  let jwtid = crypto.randomUUID()
 
  return {
    accessToken: jwt.sign(
      {
        sub: userId,
      },
      secrets.access, {
      expiresIn: configService.ACCESS_EX,
      issuer,
      audience: [role],
      jwtid
    }),
    refreshToken: jwt.sign(
      {
        sub: userId
      },
      secrets.refresh, {
      expiresIn: configService.REFRESH_EX,
      issuer,
      audience: [role],
      jwtid
    })
  }
}

export const verifyToken = async (token, tokenType) => {
  let decoded = jwt.decode(token)
  if (await exists({ key: getRevokeKey(decoded.sub , decoded.jti) })) {
    UnAuthorizedException("you are already logged out")
  }
  let secret = getTokenSecretForType(tokenType, decoded.aud[0])
  let verify = jwt.verify(token, secret)
  if (await exists({ key:getUserKey(decoded.sub) })) {
    return await get({ key:getUserKey(decoded.sub) })
  }
  let user = await Queries.findOne({ model: models.userModel, where: { _id: verify.sub } })
  if (user.changedAt && decoded.iat < user.changedAt) {
    UnAuthorizedException("you are already logged out")
  }
  await set({ key: getUserKey(decoded.sub), value: user, ttl: 30 })
  return user
}

const getTokenSecretForType = (tokenType, role) => {
  let secrets = getTokenSecretsForRole(role)
  let secret = null
  switch (tokenType) {
    case enums.tokenTypesEnum.access:
      secret = secrets.access;
      break;

    default:
      secret = secrets.refresh
  }
  return secret
}