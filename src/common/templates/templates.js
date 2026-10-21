export const emailTemplate = ({
  title,
  message,
  otp,
  expiresIn = '10 minutes',
}) => {
  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  </head>

  <body style="margin:0; padding:0; background-color:#f5f6f8; font-family:Arial, Helvetica, sans-serif; color:#1f2937;">
    <div style="width:100%; padding:40px 16px; box-sizing:border-box;">
      <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 18px rgba(0, 0, 0, 0.06);">

        <div style="padding:30px; text-align:center; background:#111827; color:#ffffff;">
          <h1 style="margin:0; font-size:24px;">Saraha</h1>
        </div>

        <div style="padding:35px 30px; text-align:center;">
          <h2 style="margin-top:0; font-size:22px;">${title}</h2>

          <p style="color:#6b7280; font-size:15px; line-height:1.7;">
            ${message}
          </p>

          ${
            otp
              ? `
                <div style="display:inline-block; margin:20px 0; padding:16px 28px; background:#f3f4f6; border-radius:8px; font-size:32px; font-weight:bold; letter-spacing:8px; color:#111827;">
                  ${otp}
                </div>

                <p style="color:#6b7280; font-size:15px; line-height:1.7;">
                  This code will expire in <strong>${expiresIn}</strong>.
                </p>
              `
              : ''
          }

          <p style="margin-top:25px; font-size:13px; color:#9ca3af;">
            If you didn't request this action, you can safely ignore this email.
          </p>
        </div>

        <div style="padding:20px 30px; text-align:center; background:#f9fafb; color:#9ca3af; font-size:12px;">
          © ${new Date().getFullYear()} Saraha. All rights reserved.
        </div>

      </div>
    </div>
  </body>
  </html>
  `;
};