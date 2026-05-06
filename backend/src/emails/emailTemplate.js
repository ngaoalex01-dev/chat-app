export const VERIFICATION_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verify Your Email</title>
</head>

<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

  <div style="background: linear-gradient(to right, #36D1DC, #5B86E5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">Verify Your Email</h1>
  </div>

  <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">

    <p>Hello,</p>
    <p>Thank you for signing up! Your verification code is:</p>

    <div style="text-align: center; margin: 30px 0;">
      <span style="font-size: 32px; font-weight: bold; letter-spacing: 5px; color: #5B86E5;">
        {verificationCode}
      </span>
    </div>

    <p>Enter this code on the verification page to complete your registration.</p>
    <p>This code will expire in 15 minutes for security reasons.</p>
    <p>If you didn't create an account with us, please ignore this email.</p>

    <p style="margin-top: 25px;">Best regards,<br>Your App Team</p>
  </div>

  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>This is an automated message, please do not reply to this email.</p>
  </div>

</body>
</html>
`;

export const WELCOME_EMAIL_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Welcome</title>
</head>

<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f5f5f5;">

  <!-- HEADER -->
  <div style="background: linear-gradient(to right, #36D1DC, #5B86E5); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 28px; font-weight: 500;">
      {company}
    </h1>
  </div>

  <!-- BODY CARD -->
  <div style="background-color: #ffffff; padding: 35px; border-radius: 0 0 12px 12px; box-shadow: 0 4px 15px rgba(0,0,0,0.05);">

    <!-- HERO IMAGE -->
    <img src="https://res.cloudinary.com/dxipgbs5g/image/upload/v1775846732/Whatsapp_app_icon_sjtvbh.jpg"
         alt="Welcome Banner"
         style="width: 100%; border-radius: 10px; margin-bottom: 20px;" />

    <h2 style="margin-top: 0;">Welcome, {name}! 🎉</h2>

    <p>
      Thanks for choosing <strong>{company}</strong>! We are happy to see you on board.
    </p>

    <!-- CTA -->
    <div style="text-align: center; margin: 30px 0;">
      <a href="{clientURL}"
         style="background: linear-gradient(to right, #36D1DC, #5B86E5); color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
        Open Chatify
      </a>
    </div>

    <p>If you need help getting started, check these out:</p>

    <!-- LINKS -->
    <div style="margin: 20px 0;">

      <p>
        <img src="https://res.cloudinary.com/dxipgbs5g/image/upload/v1775846733/UI_UX_Chat_App_Neumorphism_-_Muhammad_Hafeez_Abu_Zarim_qwjco8.jpg"
             style="width: 20px; vertical-align: middle; margin-right: 8px;" />
        <a href="#" style="text-decoration: none; color: #5B86E5; font-weight: bold;">
          Chatify App Tutorial
        </a>
      </p>

      <p>
        <img src="https://res.cloudinary.com/dxipgbs5g/image/upload/v1775846733/Tango_Message_UI_Kit_gvmtos.jpg"
             style="width: 20px; vertical-align: middle; margin-right: 8px;" />
        <a href="#" style="text-decoration: none; color: #5B86E5; font-weight: bold;">
          Theme Customisation
        </a>
      </p>

    </div>

    <p>
      We hope you enjoy this journey as much as we enjoy creating it for you.
    </p>

    <p style="margin-top: 25px;">
      Best regards,<br>Your App Team
    </p>
  </div>

  <!-- FOOTER -->
  <div style="text-align: center; padding: 20px; color: #999; font-size: 12px;">
    <p>
      <a href="#" style="color: #999; text-decoration: none;">Unsubscribe</a>
    </p>
    <p>This is an automated message, please do not reply to this email.</p>
  </div>

</body>
</html>
`;
