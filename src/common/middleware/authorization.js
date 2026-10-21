
import { ForbiddenException } from "../exceptions/index.js"


export default (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) ForbiddenException("Not allowed")

    next()
  }

}