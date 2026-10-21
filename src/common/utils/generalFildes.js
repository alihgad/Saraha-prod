import { z } from "zod"
import { enums } from "../index.js"
import { getErrorMessage } from "./validationErrors.js"
import { isValidObjectId } from "mongoose"


export default {
  phone: (lang) => z.e164({ pattern: /^01[0-25]\d{8}$/, error: getErrorMessage("wrongPhoneNumber", lang) }),
  email: (lang) => z.email({
    error: getErrorMessage("invalidEmail", lang)
  }),
  password: (lang) => z.string().max(20, { error: lang == "ar" ? "كلمة السر طويلة للغاية" : "password is too long" }).min(5, { error: "password is too short" }),
  fullName: (lang) => z.string().regex(/^[A-Za-z]{3,20}\s[A-Za-z]{3,20}$/, { error: getErrorMessage("fullName", lang) }),
  gender: (lang) => z.enum(enums.genderEnum, { error: "gender must be male or female" }),
  DOB: (lang) => z.string(),
  page: (lang) => z.coerce.number().gte(1),
  limit: (lang) => z.coerce.number().gte(1),
  id: (lang) => z.string().min(24).max(24).refine((value) => isValidObjectId(value), { error: getErrorMessage("invalidObjectId" , lang) }),
  headers: (lang) => z.object({
    authorization: (lang) => z.string().jwt({ alg: "HS256" }),
    "accept-language": (lang) => z.enum(["ar", "en"])
  }),
  stringBool: (lang) => z.stringbool({
    truthy: ["true"],
    falsy: ["false"],
    case: "sensitive",
    error: "this value must be true or false"
  }),
  file: (lang) => z.strictObject({
    fieldname: (lang) => z.string(),
    originalname: (lang) => z.string(),
    encoding: (lang) => z.string(),
    mimetype: (lang) => z.string(),
    size: (lang) => z.string(),
    destination: (lang) => z.string().optional(),
    filename: (lang) => z.string().optional(),
    path: (lang) => z.string().optional(),
    buffer: (lang) => z.string().optional()
  })

}