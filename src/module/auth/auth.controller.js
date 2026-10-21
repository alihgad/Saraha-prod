import { Router } from "express"
import { response } from "../../common/utils/index.js"
import { middleware } from "../../common/index.js"
import * as as from "./auth.service.js"
import * as av from "./auth.validation.js"
import { fileTypes } from "../../common/middleware/multer.local.js"
let { validator, auth, multerLocal, processFiles } = middleware

let authRouter = Router()

authRouter.post("/signup", multerLocal({ fileType: fileTypes.images , customPath : "users" }).single("image"), processFiles({ fileType: fileTypes.images }), validator(av.signupSchema), async (req, res, next) => {

  let user = await as.createUser(req.validate.body , req.file)

  response({
    res,
    data: user,
    status: 201,
    message: "user created"
  })
})

authRouter.post("/confirmEmail", async (req, res, next) => {

  let user = await as.confirmEmail(req.body)

  response({
    res,
    data: user,
    status: 200,
    message: "email confirmed"
  })
})

authRouter.post("/resendOtp", async (req, res, next) => {

  let message = await as.resendOTP(req.body)

  response({
    res,
    status: 200,
    message
  })
})

authRouter.post("/forgetPassword", async (req, res) => {
  let message = await as.forgetPassword(req.body.email)

  response({
    message, res
  })
})

authRouter.post("/resetPassword", async (req, res) => {
  let message = await as.resetPassword(req.body)

  response({
    message, res
  })
})




authRouter.post("/loginWithGmail", async (req, res, next) => {
  let issuer = `${req.protocol}://${req.host}`
  let { tokens, status } = await as.loginWithGmail(req.body, issuer)
  response({
    res,
    data: tokens,
    status,
    message: "user login"
  })
})

authRouter.post("/login", validator(av.loginSchema), async (req, res, next) => {
  let issuer = `${req.protocol}://${req.host}`
  let tokens = await as.login(req.validate.body, issuer)
  return response({
    res,
    data: tokens,
    message: "user login"
  })
})

authRouter.get("/rotate-token", async (req, res) => {
  let issuer = `${req.protocol}://${req.host}`
  let tokens = await as.rotateToken(req.headers.authorization, issuer)

  return response({
    data: tokens || {},
    status: 200,
    message: "token rotated",
    res
  })

})

authRouter.post("/logout", auth, async (req, res, next) => {
  let data = await as.logout(req.headers.authorization, req.body.type)
  response({
    data, res, message: "logout"
  })
})


export default authRouter