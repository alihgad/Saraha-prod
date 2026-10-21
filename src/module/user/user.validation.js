import { Types } from "mongoose";
import { z } from "zod";
import {GF} from "./../../common/index.js"

export let getUserByIdSchema = (lang)=> z.object({
  params: z.strictObject({
    userId: GF.id(lang)
  }).refine((data) => {
    return Types.ObjectId.isValid(data.userId)
  }, { message: "invalid objectId", path: ["params.userId"] })

  ,
  // headers:GF.headers(lang),
  query: z.strictObject({
    phone: GF.stringBool(lang).optional()
  })
})

export let paginationSchema = (lang)=> z.object({
  query: z.strictObject({
    page: GF.page(lang),
    limit: GF.limit(lang),
  })
})

export let updateSchema = (lang)=> z.object({
  params: z.strictObject({
    id: GF.id(lang)
  }),
  body: z.strictObject({
    phone: GF.phone(lang) ,
    fullName: GF.fullName(lang),
    gender: GF.gender(lang),
    DOB: GF.DOB(lang),
  })
})