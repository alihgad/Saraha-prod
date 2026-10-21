import express from "express"
import { connection } from "./db/index.js"
import config from "./config/config.service.js";
import cors from "cors"
import helmet from "helmet"
import * as common from "./common/index.js"
import * as routers from "./module/index.js";
import { ipKeyGenerator, rateLimit } from 'express-rate-limit'
import morgan from "morgan";
import { redisClient } from "./db/redis.connection.js";
if (process.env.NODE_ENV == "production") {
  console.log = () => { }
}

const app = express()
const port = config.port
await connection()





let corsOptions = {
  origin: function (origin, cb) {
    if (origin && !config.origins.includes(origin)) {
      cb(new Error("Not allowed origin"), origin)
    } else {
      cb(null, origin)
    }
  }
}



app.use(morgan("dev"))

app.use(cors(corsOptions), helmet(), express.json())
app.set("trust proxy", true)
app.use((req, res, next) => {
  // console.log(req.ip, req.ips, req.headers["x-forward-for"])
  next()
})
app.use(rateLimit({
  windowMs: 5 * 60 * 1000,
  limit: function (req) {
    // const data = geoip.lookup(req.headers["x-forwarded-for"])
    // console.log(data)
    // return data?.country == "EG" ? 100 : 0
    return 100
  },
  // legacyHeaders: false,
  // skip: (req, res) => true,
  message: function (req, res) {
    res.status(429).json({
      message: "Too many request"
    })
  },
  // skipSuccessfulRequests: true,
  // requestWasSuccessful: (req, res) => {
  //   return res.statusCode == 404
  // },
  keyGenerator: (req) => {
    console.log(req.ip, req.ips, req.headers["x-forwarded-for"])
    let lastIp = ipKeyGenerator(req.ip)
    // console.log(lastIp, req.url)
    return `${lastIp}::${req.url}`
  },
  store: {
    async incr(key, cb) {
      console.log(key, "incr")
      try {
        const count = await redisClient.incr(key)
        console.log(count)
        if (count === 3) {
          await redisClient.expire(key, 300)
        }
        cb(null, count)
      } catch (err) {
        cb(err)
      }
    },
    async decrement(key) {
      console.log(key, "dec")

      if (await redisClient.exists(key)) {
        await redisClient.decr(key)
      }
    }
  }
}))


app.use("/auth", routers.authRouter)
app.use("/user", routers.userRouter)
app.use("/message", routers.messageRouter)
app.use("/uploads", express.static("uploads"))



app.get("/", (req, res, next) => {
  res.setHeader("Content-Type", "text/html")
  res.status(200).send(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
  <script>alert( localStorage.getItem("token") )</script>
</body>
</html>`)
})

app.use("/{*dummy}", (req, res, next) => {
  res.status(404).json({
    message: "Route not found",
    route: req.params.dummy.join("/")
  })
})

app.use(common.middleware.globalErrorHandler)

app.listen(port, () => {
  console.info("server is running on port", port)
})
