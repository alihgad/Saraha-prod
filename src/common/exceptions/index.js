export const NotFoundException = (message)=>{
  throw new Error(message , {cause : 404})
}


export const ConflictException = (message)=>{
  throw new Error(message , {cause : 409})
}

export const ForbiddenException = (message)=>{
  throw new Error(message , {cause : 403})
}

export const BadRequestException = (message)=>{
  throw new Error(message , {cause : 400})
}

export const UnAuthorizedException = (message)=>{
  throw new Error(message , {cause : 401})
}

export const ServerException = (message)=>{
  throw new Error(message , {cause : 500})
}