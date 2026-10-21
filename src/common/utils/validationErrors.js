export let getErrorMessage = (errCode, lang) => errors[errCode][lang]

let errors = {
  invalidEmail: {
    en: "this is invalid email , please enter email like this example@test.try",
    ar: "البريد الالكتروني غير صحيح"
  },
  fullName: {
    en: "full name must be like name1 name2",
    ar: "يجب ان يكون الاسم كما يلي name1 name2"
  },
  wrongPhoneNumber : {
    en : "this is invalid phone number , please enter egyptian phone number like this 01xxxxxxxxx" ,
    ar : "رقم الهاتف غير صحيح ، يجب ان يكون رقم الهاتف مصري"
  },
  invalidObjectId:{
    en : "This isn't valid ObjectId",
    ar : "معرف مونجو غير صحيح"
  }
}
