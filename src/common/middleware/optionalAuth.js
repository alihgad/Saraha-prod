import { models } from "../../db/index.js"
import { findOne } from "../../db/repositery/base.repo.js"
import { BadRequestException, NotFoundException } from "../exceptions/index.js"
import { enums } from "../index.js"
import { myCompare, verifyToken } from "../utils/index.js"

export const optionalAuth = async (req, res, next) => {

  let authorization = req.headers?.authorization
  if (!authorization) {
    return next() 
  }

  let [prefix, token] = authorization.split(" ")

  switch (prefix) {
    case enums.authEnum.Basic:
      let data = Buffer.from(token, "base64").toString()
      let [email, password] = data.split(":")
      let user = await findOne({ model: models.userModel, where: { email } })
      let check = myCompare({ plainText: password, hashedText: user.password })
      if (!check) NotFoundException("user not found")
      req.user = user
      next()

      break

    case enums.authEnum.Bearer:

      req.user = await verifyToken(token, enums.tokenTypesEnum.access)
      next()
      break

    default:
      BadRequestException("invalid auth type")
  }

}