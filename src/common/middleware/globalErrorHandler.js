import multer from "multer"

export default (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    console.log(err)
    res.status(err.status || err.cause || 500).json({
      type : "Multer Error",
      message: err.message,
      code: err.code,
      storageErrors: err.storageErrors,
      filed: err.field,
      fileName: err.fileName
    })
  }
  else {

    res.status(err.status || err.cause || 500).json({
      message: err.message,
      stack: err.stack
    })
  }
}