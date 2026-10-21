import multer from "multer"
import path from "node:path"
import fs from "node:fs"
import { BadRequestException } from "../exceptions/index.js"
import { fileTypeFromBuffer, fileTypeFromFile } from "file-type"

export const fileTypes = {
  images: ["image/png", "image/jpg", "image/jpeg", "image/webp"],
  pdf: ["application/pdf"],
  video: ["video/mp4",]
}


export const multerLocal = ({ fileType, customPath }) => {

  let storage = multer.diskStorage({
    destination: (req, file, cb) => {
      let folderPath = path.resolve("./uploads")
      if(customPath){
        folderPath  = path.resolve(`./uploads/${customPath}`)
      }

      if (!fs.existsSync(folderPath)) {
        fs.mkdirSync(folderPath)
      }
      cb(null, folderPath)
    },
    filename: (req, file, cb) => {
      cb(null, Date.now() + "-" + file.originalname)
    }
  })

  let fileFilter = (req, file, cb) => {
    if (!fileType.includes(file.mimetype)) {
      cb(BadRequestException("wrong file type"))
    }

    cb(null, true)
  }

  return multer({
    storage,
    fileFilter
  })
}

export const multerMemory = ({ fileType }) => {

  let storage = multer.memoryStorage()
  let fileFilter = (req, file, cb) => {
    if (!fileType.includes(file.mimetype)) {
      cb(BadRequestException("wrong file type"))
    }

    cb(null, true)
  }

  return multer({
    storage,
    fileFilter
  })
}


export const processFiles = ({ fileType }) => {
  return async (req, res, next) => {
    if (req.file) {
      req.file = await processSingleFile(req.file, fileType)
    } else if (Array.isArray(req.files) && req.files.length > 0) {
      for (let file of req.files) {
        file = await processSingleFile(file, fileType)
      }
    } else if (typeof req.files == "object" && Object.keys(req.files).length > 0) {
      let keys = Object.keys(req.files)
      for (let i = 0; i < keys.length; i++) {
        let key = req.files[keys[i]]
        for (let j = 0; j < key.length; j++) {
          key[j] = await processSingleFile(key[j], fileType)
        }
      }
    }

    next()
  }

}


const processSingleFile = async (file, fileType) => {
  let result

  if (file.buffer) {
    result = await fileTypeFromBuffer(file.buffer)
  } else {
    result = await fileTypeFromFile(file.path)
  }

  if (!result || !fileType.includes(result.mime)) {
    file.path && fs.unlinkSync(file.path)
    BadRequestException("Invalid file type")
  }

  if (file.buffer) {
    let folderPath = "./uploads"
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath)
    }
    let fullPath = `./uploads/${Date.now()}.${result.ext}`
    fs.writeFileSync(fullPath, file.buffer)
    file.fullPath = fullPath
  }
  return file
}
