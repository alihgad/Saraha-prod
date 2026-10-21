import { EventEmitter } from "node:events";
import { sendMail } from "../services/mail.service.js";
import {emailTemplate} from "../templates/templates.js"
import { eventsEnum } from "../enum/events.enum.js";

export let eventEmitter = new EventEmitter()
eventEmitter.on(eventsEnum.signup, async ({ recipients, otp }) => {
  try {
    await sendMail({
      recipients,
      subject: "Welcome to my app",
      html: emailTemplate({
        title: "Email verification",
        message: `Your OTP `,
        otp,
        expiresIn: "5 minutes"
      })
    })
  } catch (e) {
    console.log(e.message)
    console.log(e)
  }
})

eventEmitter.on(eventsEnum.forget, async ({ recipients, otp }) => {
  try {
    await sendMail({
      recipients,
      subject: "Forget password OTP",
      html: emailTemplate({
        title: "Email verification",
        message: `Your OTP to reset your password`,
        otp,
        expiresIn: "5 minutes"
      })
    })
  } catch (e) {
    console.log(e.message)
    console.log(e)
  }
})




