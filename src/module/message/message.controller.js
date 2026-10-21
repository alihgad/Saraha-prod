import { Router } from "express"
import { response, middleware } from "../../common/index.js"
import * as ms from "./message.service.js"
import * as mv from "./message.validation.js"
import { fileTypes, multerLocal, processFiles } from "../../common/middleware/multer.local.js"

export const messageRouter = Router({
  caseSensitive : true,
  strict : true,
  mergeParams: true
})


messageRouter.post("/send",
  async(req,res,next)=>{
  await middleware.optionalAuth(req, res, next)
  },
  multerLocal({ fileType: fileTypes.images, customPath: "messages" }).array("images"),
  processFiles({ fileType: fileTypes.images }),
  middleware.validator(mv.sendMessageSchema),
  async (req, res, next) => {

    let data = await ms.sendMessage(req.body, req.files , req.user?._id)
    response({
      res, data, status: 201, message: "message sent"
    })
  })


messageRouter.get("/" , middleware.auth ,async (req,res,next)=>{
  let data = await ms.getMessages(req.user._id , req.query )
  return response({
    res , message : "Messages fetched" , data
  })
})

messageRouter.delete("/:messageId" , middleware.auth , async(req,res,next)=>{
  let data = await ms.deleteMessage(req.user._id,req.params.messageId )

  response({
    data , message :`message ${ data.deletedCount ? "deleted" : "not found"}`,res , status : data.deletedCount ? 200 : 404
  })
  
})