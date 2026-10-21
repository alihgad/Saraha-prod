import { models } from "../index.js"
import * as base from "./base.repo.js"

let model = models.messageModel 

export const findMessage = async ({ where = {}, check = false, select }) => {
  return await base.findOne({ model, where, check, select })
}

export const findMessages = async ({  where = {}, limit, skip , select ,sort , page }) => {
  return await base.find({model ,where, limit, skip , select , sort ,page })
}



export const createMessage = async ({data }) => {
  return await base.create({model , data})
}

export const updateMessage = async ({  data, where }) => {

  return await base.updateOne({model,where, data})
}


export const deleteMessage = async ({where})=>{
    return await base.deleteOne({model,where})

}