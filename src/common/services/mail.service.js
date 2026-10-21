import { createTransport } from "nodemailer"
import configService from "../../config/config.service.js"


let transporter = createTransport({
  service: "gmail",
  auth: {
    user: configService.APP_EMAIL,
    pass: configService.APP_PASSWORD
  }
})



export const sendMail = async ({
  recipients,
  subject,
  attachments,
  html,
  text
}) => {
  let info = await transporter.sendMail({
    from: `sarah project <${configService.APP_EMAIL}>`,
    ...recipients,
    subject ,
    text ,
    html ,
    attachments
  })
  console.log(info.accepted)
}

