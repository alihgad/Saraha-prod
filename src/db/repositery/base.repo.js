import { BadRequestException, NotFoundException } from "../../common/exceptions/index.js"

export const findOne = async ({ model, where = {}, check = false, select }) => {
  if (!model) BadRequestException("model not provided")
  let data = await model.findOne(where).select(select)
  if (!data && !check) NotFoundException("target document not found")
  return data
}

export const find = async ({ model, where = {}, limit, skip, sort, select , page  }) => {

  if (!model) BadRequestException("model not provided")


  let data = await model.find(where).skip(skip).limit(limit).sort(sort).select(select)
  let count = await model.countDocuments(where)
  let totalPages = Math.ceil(count / limit)
  let hasNextPage = page != totalPages

  return { data, meta :{ count, totalPages, currentPage: page,hasNextPage , hasPreviousPage : page != 1} }
}



export const create = async ({ model, data }) => {
    if (!model) BadRequestException("model not provided")

  return await model.create(data)
}

export const updateOne = async ({ model, data, where }) => {
    if (!model) BadRequestException("model not provided")


  return await model.updateOne(where, data, { returnDocument: "after" })
}

export const deleteOne = async ({model , where})=>{
    if (!model) BadRequestException("model not provided")

  return model.deleteOne(where)
}