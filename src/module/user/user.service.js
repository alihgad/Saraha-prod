import {userRepo as ur} from "./../../db/index.js"
export const getAllUsers = async (page, limit) => await ur.findUsers({ limit: limit, skip: (page - 1) * limit })

export const getUserById = async userId => await ur.findUser({
  where: { _id: userId },
  select: "-password -confirmEmail -__v -role -provider"
})



