export const validator = (schema) => {
  return (req, res, next) => {
    let { success, error, data } = schema(req.headers["accept-language"]).safeParse({
      body : req.body,
      params : req.params,
      query : req.query,
      headers : req.headers,
      file : req.file,
      file : req.files
    })


    if (!success) {
      return res.status(400).json({
        message: "validation error",
        issues: error.issues
      })
    }
    req.validate = data
    next()
  }
} 