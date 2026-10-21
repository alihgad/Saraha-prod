import {config} from "dotenv";

let envFilePath = `.env.${process.env.NODE_ENV}`;
config({path: envFilePath});



export default {
  port : Number(process.env.PORT),
  DB_URI : process.env.DB_URI,
  ENC_ALGO : process.env.ENC_ALGO,
  KEY : process.env.KEY,
  IV_LENGTH : Number(process.env.IV_LENGTH),
  USER_REFRESH_SECRET_KEY : process.env.USER_REFRESH_SECRET_KEY ,
  USER_ACCESS_SECRET_KEY : process.env.USER_ACCESS_SECRET_KEY ,
  ADMIN_REFRESH_SECRET_KEY : process.env.ADMIN_REFRESH_SECRET_KEY ,
  ADMIN_ACCESS_SECRET_KEY : process.env.ADMIN_ACCESS_SECRET_KEY,
  HASH_SALT : Number(process.env.HASH_SALT),
  GOOGLE_CLIENT_ID : process.env.GOOGLE_CLIENT_ID,
  GOOGLE_SECRET : process.env.GOOGLE_SECRET,
  REDIS_URI : process.env.REDIS_URI,
  ACCESS_EX : Number(process.env.ACCESS_EX),
  REFRESH_EX : Number(process.env.REFRESH_EX),
  APP_PASSWORD : process.env.APP_PASSWORD,
  APP_EMAIL : process.env.APP_EMAIL,
  MAX_SEND_RETRIES : process.env.MAX_SEND_RETRIES,
  MAX_OTP_RETRIES : process.env.MAX_OTP_RETRIES,
  origins : process.env.ORIGINS.split(",")
}