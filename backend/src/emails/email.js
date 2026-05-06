import { transporter } from "./gmail.config.js";
import { VERIFICATION_EMAIL_TEMPLATE, WELCOME_EMAIL_TEMPLATE  } from "./emailTemplate.js";
import { ENV } from "../lib/env.js";

export const sendVerificationEmail = async (email, verificationToken) => {

	 try {
    const info = await transporter.sendMail({
      from: `"CHATIFY" <${ENV.EMAIL_USER}>`,
      to: email,
      subject: "Verify your email",
      html: VERIFICATION_EMAIL_TEMPLATE.replace("{verificationCode}", verificationToken),
    });

    console.log("Verification email sent:", info.messageId);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error(`Error sending verification email: ${error}`);
  }
};

export const sendWelcomeEmail = async (email, name) => {

  try {
      const html = WELCOME_EMAIL_TEMPLATE
      .replace(/{name}/g, name)
      .replace(/{company}/g, "Chatify-App")
      .replace(/{clientURL}/g, ENV.clientURL);

      await transporter.sendMail({
        from: `"Chatify" <${ENV.EMAIL_USER}>`,
        to: email,
        subject: "Welcome 🎉",
        html: html,
      });

      console.log("Welcome email sent successfully");
  } catch (error) {
    console.error("Error sending welcome email:", error);
    throw new Error(`Error sending welcome email: ${error}`);
  }
};
