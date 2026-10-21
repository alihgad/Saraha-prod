import crypto from "node:crypto"
import config from "./../../config/config.service.js"
let {ENC_ALGO ,IV_LENGTH , KEY } = config

let key = Buffer.from(KEY , "hex")



export const encrypting = (data)=>{
  const iv = crypto.randomBytes(IV_LENGTH)
  const cipher =  crypto.createCipheriv(ENC_ALGO, key, iv)
  let encrypted = cipher.update(data , "utf-8" ,"hex")
  encrypted += cipher.final("hex")

  return `${iv.toString("hex")}::${encrypted}`
}

export const decrypting = (data)=>{
  let [iv , cipher] = data.split("::")
  iv = Buffer.from(iv , "hex")
  let plainText = crypto.createDecipheriv(ENC_ALGO ,key ,iv )
  let result = plainText.update(cipher , "hex" , "utf-8" )
  result += plainText.final("utf-8")
  return result
}

