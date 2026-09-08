import mailgen from "mailgen";
import nodemailer from "nodemailer";

const sendMail = async (options) => {
  const mailGenerator = new mailgen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://taskmanager.com/",
    },
  });

  const mailText = mailGenerator.generatePlaintext(options.mailgenContent);
  const mailHtml = mailGenerator.generate(options.mailgenContent);

  let transport = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMPT_HOST,
    port: process.env.MAILTRAP_SMPT_PORT,
    auth: {
      user: process.env.MAILTRAP_SMPT_USERNAME,
      pass: process.env.MAILTRAP_SMPT_PASSWORD,
    },
  });

  const mail = {
    from: "test.manager@test.com",
    to: options.email,
    subject: options.subject,
    text: mailText,
    html: mailHtml,
  };

  try {
    await transport.sendMail(mail);
  } catch (err) {
    console.error(
      "Something went wrong the mail is not sending, maybe in env file some data is wrong",
    );
    console.error("Error:- ", err);
  }
};

const emailVerificationContent = (username, emailVerificationURL) => {
  return {
    body: {
      name: username,
      intro:
        "Welcome to Task Manager,  We\'re very excited to have you on board.",
      actions: {
        instructions: "Click following button for verification of your email",
        button: {
          color: "#26C471",
          text: "Verify your email",
          link: emailVerificationURL,
        },
      },
      outro: "Need any help, reply in this email.",
    },
  };
};

const passwordResetContent = (username, passwordResetURL) => {
  return {
    body: {
      name: username,
      intro:
        "You have got this email because we have recieved a password reset request from your account",
      actions: {
        instructions: "Click following button for reset your password",
        button: {
          color: "#EE3266",
          text: "Reset your password",
          link: passwordResetURL,
        },
      },
      outro: "Need any help, reply in this email.",
    },
  };
};

export { passwordResetContent, emailVerificationContent, sendMail };
