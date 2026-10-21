import { Router } from "express"
import { decrypting, response } from "../../common/utils/index.js"
import * as us from "./user.service.js"
import * as uv from "./user.validation.js"
import { middleware } from "../../common/index.js"
import { roleEnum } from "../../common/enum/role.enum.js"
import { fileTypes, multerLocal, multerMemory, processFiles } from "../../common/middleware/multer.local.js"
import { messageRouter } from "../message/message.controller.js"

let userRouter = Router()
let cache = {}


userRouter.get("/", middleware.auth, middleware.authorization([roleEnum.user]), async (req, res) => {
  req.user.phone = decrypting(req.user.phone)
  return response({
    data: req.user || {},
    status: 200,
    message: " user fetched ",
    res
  })
})

userRouter.get("/profile/:userId", middleware.validator(uv.getUserByIdSchema), async (req, res) => {
  let userId = req.validate.params.userId
  let data = {}
  if (cache.userId != undefined) {
    data = cache.userId
  } else {
    data = await us.getUserById(userId)
    cache.userId = data
  }

  if (req.validate.query.phone) {
    data.phone = decrypting(data.phone)
  }

  return response({
    data: data || {},
    status: 200,
    message: " user fetched ",
    res
  })
})

userRouter.get("/all",
  // middleware.auth,
  middleware.validator(uv.paginationSchema),
  async (req, res) => {
    let { page, limit } = req.validate.query
    let users = await us.getAllUsers(page, limit)
    return response({
      data: users,
      status: 200,
      message: "users fetched",
      res
    })
  })


userRouter.post("/image", multerLocal({ fileType: [...fileTypes.images] }).fields([{ name: "image", maxCount: 3 }]),
  processFiles({ fileType: [...fileTypes.images] }),
  (req, res, next) => {
    response({
      res, data: { file: req.file || req.files, body: req.body }
    })
  })


export default userRouter