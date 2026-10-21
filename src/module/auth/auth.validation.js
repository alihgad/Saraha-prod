import { z } from "zod"
import {GF} from "../../common/index.js"


let loginBody = (lang) => z.strictObject({
  email: GF.email(lang),
  password: GF.password(lang)
})

export let loginSchema = (lang)=> z.object({
  body: loginBody(lang)
  // headers : GF.headers(lang)
})

let signupBody =(lang)=> loginBody(lang).safeExtend({
  confirmPassword: GF.password(lang),
  phone: GF.phone(lang),
  fullName:GF.fullName(lang),
  gender:GF.gender(lang),
  DOB:GF.DOB(lang),
}).superRefine((data, ctx) => {
  if (data.confirmPassword !== data.password) {
    ctx.addIssue({
      code: "custom",
      path: ["confirmPassword"],
      message: "password don't match confirm password"
    })
  }

  if (data.fullName == "admin") {
    ctx.addIssue({
      code: "invalid_value",
      path: ["fullName"],
      message: "you add invalid value"
    })
  }
})

export let signupSchema = (lang)=>z.object({
  body: signupBody(lang)
  // file : GF.file(lang)
})

export let rotateTokenSchema =(lang)=> z.object({
  headers :GF.headers(lang)
})



