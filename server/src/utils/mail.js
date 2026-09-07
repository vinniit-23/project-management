import MailGen from "mailgen";
import nodemailer from "nodemailer";

/**
 * For sending email we used Mailgen 
 * mailgen:- A Node.js package that generates clean, responsive HTML e-mails for sending transactional mail.

so mailgen gives us email templates for creating and customising email.

and for sending email we used nodemailer and mailtrap
nodemailer is email sending library while mailtrap email service provider.

nodemailer uses resources which is given by mailtrap
resources are:- hosturl, port, username, password etc.
 */

const sendEmail = async (options) => {
  const mailGenerator = new MailGen({
    theme: "default",
    product: {
      name: "Task Manager",
      link: "https://taskmanagelink.com",
    },
  });

  const emailPlainText = mailGenerator.generatePlaintext(
    options.mailgenContent,
  );
  const emailHTML = mailGenerator.generate(options.mailgenContent);

  const transport = nodemailer.createTransport({
    host: process.env.MAILTRAP_SMPT_HOST,
    port: process.envMAILTRAP_SMPT_PORT,
    auth: {
      user: process.env.MAILTRAP_SMPT_USERNAME,
      pass: process.env.MAILTRAP_SMPT_PASSWORD,
    },
  });

  const mail = {
    from: "mail.taskmanager@example.com",
    to: options.email,
    subject: options.subject,
    text: emailPlainText,
    html: emailHTML,
  };

  try {
    await transport.sendMail({});
  } catch (err) {
    console.error("Something went wrong in email service");
    console.error("Error ", err);
  }
};

const emailVerificationMailGenContent = (username, verificationUrl) => {
  return {
    body: {
      name: username,
      intro: `Welcome to our App, We'are excited to have you on board. please verify your Email`,
      action: {
        instructions: "Please verify your Email by clicking below button.",
        button: {
          color: "#22BC66", // Optional action button color
          text: "Verify your Email",
          link: verificationUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};
const forgetPasswordMailGenContent = (username, passwordResetUrl) => {
  return {
    body: {
      name: username,
      intro: `We got request to reset your password of your account`,
      action: {
        instructions: "Reset your password, Click on the below button.",
        button: {
          color: "#bc2222", // Optional action button color
          text: "Reset Password",
          link: passwordResetUrl,
        },
      },
      outro:
        "Need help, or have questions? Just reply to this email, we'd love to help.",
    },
  };
};

export {
  forgetPasswordMailGenContent,
  emailVerificationMailGenContent,
  sendEmail,
};
