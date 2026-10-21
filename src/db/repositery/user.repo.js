// import { BadRequestException, NotFoundException } from "../../common/exceptions/index.js"
import { models } from "../index.js"
import * as base from "./base.repo.js"

let model = models.userModel

export const findUser = async ({ where = {}, check = false, select }) => {
  return await base.findOne({ model, where, check, select })
}

export const findUsers = async ({ where = {}, limit, skip, select, sort, page }) => {
  return await base.find({ model, where, limit, skip, select, sort, page })
}



export const createUser = async ({ data }) => {

  return await base.create({ model, data })
}

export const updateUser = async ({ data, where }) => {

  return await base.updateOne({model, where, data})
}