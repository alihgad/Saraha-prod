import mongoose, { Types } from "mongoose";


let messageSchema = new mongoose.Schema({
  content: {
    type: String,
    minLength: 5,
    maxLength: 5000,
    required: function () {
      return !this.images.length
    }
  },
  images: {
    type: [String],
  },
  receiverId: {
    type: Types.ObjectId,
    ref: "user",
    required: true
  },
  senderId: {
    type: Types.ObjectId,
    ref: "user"
  }
}, {
  timestamps: true,
  strictQuery: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

export const messageModel = mongoose.model("message" , messageSchema)
