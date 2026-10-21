import bcrypt from "bcrypt"
import configService from "../../config/config.service.js"

export const myHash = async (plainText) => {
  return await bcrypt.hash(plainText, configService.HASH_SALT)
}

export const myCompare = async ({ plainText, hashedText }) => {
  return await bcrypt.compare(plainText, hashedText)
}