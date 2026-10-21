import mongoose from "mongoose";
import { enums } from "../../common/index.js";


let userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 30,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    minLength: 3,
    maxLength: 30,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: function () {
      return this.provider == enums.providerEnum.system
    },
    minLength: 6
  },
  DOB: Date,
  gender: {
    type: String,
    enum: Object.values(enums.genderEnum),
    default: enums.genderEnum.male
  },
  image: String,
  deletedAt: Date,
  confirmEmail: Boolean ,
  phone: String,
  provider: {
    type: Number,
    enum: Object.values(enums.providerEnum),
    default: enums.providerEnum.system
  },
  role: {
    type: Number,
    enum: Object.values(enums.roleEnum),
    default: enums.roleEnum.user
  },
  changedAt: Number
}, {
  timeStamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})


userSchema.virtual("fullName").set(function (value) {
  let [firstName, lastName] = value.split(" ")
  this.firstName = firstName
  this.lastName = lastName
}).get(function () {

  return `${this.firstName} ${this.lastName}`
})

export default mongoose.model("user", userSchema)