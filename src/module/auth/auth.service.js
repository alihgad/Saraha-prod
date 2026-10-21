
import { userRepo as ur } from "../../db/index.js"
import { exceptions, verifyToken, createTokens, myCompare, enums, encrypting, myHash } from "../../common/index.js"
import { OAuth2Client } from 'google-auth-library';
import configService from "../../config/config.service.js";
import { BadRequestException, NotFoundException } from "../../common/exceptions/index.js";
import { findOne } from "../../db/repositery/base.repo.js";
import jwt from "jsonwebtoken"
import { del, exists, get, incr, keys, set, ttl } from "../../common/services/cache.service.js";
import { getPrefixRevoke, getRevokeKey } from "../../common/utils/token.service.js";
import { eventEmitter } from "../../common/events/email.events.js";
import crypto from "node:crypto"

const MAX_SEND_RETRIES = configService.MAX_SEND_RETRIES
const MAX_OTP_RETRIES = configService.MAX_OTP_RETRIES

export const getUserKey = userId => `user::${userId.toString()}`
export const getUserSendKey = userId => `send::${getUserKey(userId)}`
export const getUserOTPKey = userId => `OTP::${getUserKey(userId)}`
export const getUserOTPForgetKey = userId => `OTP::forget::${getUserKey(userId)}`
export const getUserOTPTriesKey = userId => `tries::${getUserOTPKey(userId)}`

export const createUser = async (data, file) => {
  let exists = await ur.findUser({ where: { email: data.email }, check: true })

  if (exists) exceptions.ConflictException("This user already exists")
  let imagePath = ""
  if (file && file.path) {
    imagePath = "uploads" + file.path.split("uploads")[1]
  }

  if (file && file.fullPath) {
    imagePath = file.fullPath
  }

  let user = await ur.createUser({ data: { ...data, phone: data.phone ? encrypting(data.phone) : null, DOB: new Date(data.DOB), password: await myHash(data.password.trim()), image: imagePath } })

  await createAndSendOtp({
    event: enums.eventsEnum.signup,
    email: data.email,
    key: getUserOTPKey(user._id)
  })

  return user || {}
}

export const resendOTP = async ({ email, topic }) => {
  let user = await ur.findUser({
    where: { email }
  })

  switch (topic) {
    case "signup":

      if (await exists({ key: getUserOTPKey(user._id) })) {
        BadRequestException("can't send new otp while old one is active")
      }

      const key = getUserSendKey(user._id)

      let times = await get({ key })

      if (times) {
        if (times == MAX_SEND_RETRIES) {
          BadRequestException(`you reach your limit please try after ${await ttl({ key }) / 60} minutes `)
        } else {
          await incr({ key })
        }
      } else {
        await set({ key, value: 1, ttl: 9000 })
      }

      let otp = crypto.randomInt(99999, 1000000)
      await set({
        key: getUserOTPKey(user._id),
        value: otp,
        ttl: 5 * 60
      })
      eventEmitter.emit(enums.eventsEnum.signup, { recipients: { to: email }, otp })

      break;
  }

  return `new otp sent for ${topic}`
}

export const confirmEmail = async ({ otp, email }) => {
  let user = await ur.findUser({
    where: { email }
  })

  await blockUser(user._id)

  let redisOtp = await get({ key: getUserOTPKey(user._id) })

  if (redisOtp == otp) {
    await user.updateOne({ $set: { confirmEmail: true } })
    await del({ keys: [getUserOTPKey(user._id)] })
    return user
  } else {
    await wrongOtpHandler(user._id)
  }
}

export const login = async (where, issuer) => {
  let { email, password } = where
  let user = await ur.findUser({ where: { email } })
  let check = await myCompare({ plainText: password, hashedText: user.password })
  if (!user || !check) exceptions.NotFoundException("user not found")

  let tokens = createTokens({
    userId: user._id,
    role: user.role,
    issuer: issuer
  })

  return tokens

}

export const rotateToken = async (refreshToken, issuer) => {
  let user = await verifyToken(refreshToken, enums.tokenTypesEnum.refresh)
  let tokens = createTokens({ issuer, userId: user._id, role: user.role })
  await revokeToken(refreshToken)
  return tokens
}

async function verifyGoogleId(idToken) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: configService.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload.email_verified) BadRequestException("email is not verified")
  return payload
}


export const loginWithGmail = async ({ idToken }, issuer) => {
  let payload = await verifyGoogleId(idToken)
  let { email, given_name, family_name, picture } = payload
  let user = await findOne({ model: userModel, where: { email }, check: true })
  if (user) {
    let tokens = createTokens({
      userId: user._id, issuer
    })
    return { tokens, status: 200 }
  }

  user = await ur.createUser({
    data: {
      email, firstName: given_name, lastName: family_name, image: picture, provider: enums.providerEnum.google, confirmEmail: true
    }
  })

  let tokens = createTokens({
    userId: user._id, issuer
  })
  return { tokens, status: 201 }
}

export const logout = async (auth, type) => {
  let [bearer, token] = auth.split(" ")
  switch (type) {
    case enums.logoutEnum.all:
      let data = jwt.decode(token)
      await ur.updateUser({
        data: { changedAt: Math.ceil(Date.now() / 1000) },
        where: { _id: data.sub }
      })

      console.log(await del({ keys: [getUserKey(data.sub)] }))
      let arr = await keys({ prefix: getPrefixRevoke(data.sub) })
      console.log(await del({ keys: arr }))
      break;
    default:
      await revokeToken(token)
      break;
  }

}

const revokeToken = async (token) => {
  let data = jwt.decode(token)
  let nowSec = Math.ceil(Date.now() / 1000)
  let iat = nowSec - data.iat
  let ttl = configService.REFRESH_EX - iat
  set({ key: getRevokeKey(data.sub, data.jti), value: 1, ttl })
}


export const forgetPassword = async (email) => {
  let user = await ur.findUser({
    where: { email }
  })
  await user.updateOne({
    $set: {
      changedAt: Date.now()
    }
  })
  let arr = await keys({ prefix: getPrefixRevoke(user._id) })
  arr.length && await del({ keys: arr })

  createAndSendOtp({
    event: enums.eventsEnum.forget,
    email,
    key: getUserOTPForgetKey(user._id)
  })

  return "done"
}

const blockUser = async (userId) => {
  let userOTPRetries = await get({ key: getUserOTPTriesKey(userId) })
  if (userOTPRetries && userOTPRetries == MAX_OTP_RETRIES) {
    del({ keys: [getUserOTPKey(userId)] })
    BadRequestException(`try again after ${Math.ceil(await ttl({ key: getUserOTPTriesKey(userId) }) / 60)} minutes`)
  }
}
export const resetPassword = async ({ email, otp, newPassword }) => {
  let user = await ur.findUser({
    model: models.userModel,
    where: { email }
  })

  await blockUser(user._id)

  let redisOtp = await get({ key: getUserOTPForgetKey(user._id) })

  if (!redisOtp) {
    NotFoundException("otp not found")
  }

  if (redisOtp == otp) {
    await user.updateOne({
      $set: {
        password: await myHash(newPassword),
        changedAt: Date.now()
      }
    })
    return "user password changed"
  } else {
    await wrongOtpHandler(user._id)
  }
}

const wrongOtpHandler = async (userId) => {
  let key = getUserOTPTriesKey(userId)
  if (await exists({ key })) {
    await incr({ key })
  } else {
    await set({ key, value: 1, ttl: 600 })
  }
  BadRequestException("Wrong otp")
}


const createAndSendOtp = async ({ event, email, key }) => {
  let otp = crypto.randomInt(99999, 1000000)
  set({
    key,
    value: otp,
    ttl: 5 * 60
  })
  eventEmitter.emit(event, { recipients: { to: email }, otp })
}




