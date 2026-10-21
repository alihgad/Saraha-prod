import { redisClient as client } from "../../db/redis.connection.js"

export const set = async ({ key, value, ttl = undefined }) => {
  if (typeof value !== "string") {
    value = JSON.stringify(value)
  }
  return await client.set(key, value, { EX: ttl })
}

export const get = async ({ key }) => {
  let data = await client.get(key)
  let result
  try {
    result = JSON.parse(data)
  } catch {
    result = data
  }

  return result
}


export const ttl = async ({key})=>await client.ttl(key)
export const exists = async ({key})=>await client.exists(key)
export const del = async ({keys})=>await client.del(keys)
export const keys = async ({prefix})=>await client.keys(`${prefix}*`)
export const incr = async({key}) => await client.incr(key)
