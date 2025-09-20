/** @format */

const transporter = require("@/config/ConfigEmail");
const SendEmail = async ({ html, to, subject }) => {
  await transporter.sendMail({
    from: "EngLish FlashCard ",
    to,
    subject,
    html,
  });
};
module.exports = SendEmail;
