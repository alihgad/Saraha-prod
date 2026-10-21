import { createClient } from "redis";
import config from "./../config/config.service.js"

export const redisClient = createClient({
  url: config.REDIS_URI
})

export const redisConnection = async() => {
  try {
    await redisClient.connect()
    console.info("redis connected")
  }catch(e){
    console.error(e)
    throw(e)
  }
}