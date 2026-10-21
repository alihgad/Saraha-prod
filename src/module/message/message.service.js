import { messageTypeEnum } from "../../common/enum/index.js"
import { BadRequestException } from "../../common/exceptions/index.js"
import { userRepo as ur, messageRepo as mr } from "../../db/index.js"

export const sendMessage = async (data, files, senderId) => {
  let { receiverId } = data
  if (senderId) data.senderId = senderId
  if (files) {
    let imagesPaths = []
    for (const file of files) {
      let path = "uploads" + (file.path || file.fullPath).split("uploads")[1]

      imagesPaths.push(path)
    }
    data.images = imagesPaths
  }
  await ur.findUser({
    where: { _id: receiverId },
    select: "_id",
    check: true
  })
  return await mr.createMessage({ data })
}


export const getMessages = async (id, { type, page, limit }) => {


  page = Number(page) || 1
  limit = Number(limit) || 5
  let skip = (page - 1) * limit

  let filter = {}

  switch (Number(type)) {
    case messageTypeEnum.sender:
      filter.senderId = id
      break
    case messageTypeEnum.receiver:
      filter.receiverId = id
      break
    case messageTypeEnum.all:
      filter.$or = [{ senderId: id }, { receiverId: id }]
      break
    default:
      BadRequestException("wrong type value")
  }

  return await mr.findMessages({
    where: filter,
    limit,
    skip,
    page
  })
}


export const deleteMessage = async (userId, id) => {
  return await mr.deleteMessage({ where: { _id: id, receiverId: userId } })
}