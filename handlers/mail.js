const nodemailer = require('nodemailer');
const pug= require('pug');
const juice= require('juice');
const htmlToText= require('html-to-text');
const promsify= require('es6-promisify');

const transport = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

/* Basic sending mail
transport.sendMail({
  from: "Wes Bos <wesbos@gmail.com>",
  to: "randy@example.com",
  subject: "Just trying things out",
  html: "hey <strong>whats up??</strong>",
  text: "hey whats up??"
}); */

 const generateHTML = (filename, options={}) => {
    const html = pug.renderFile(`${__dirname}/../views/email/${filename}.pug`)
    return html;
    }


//using it for our forgot password
exports.send = async (options) => {
    const html = generateHTML(options.filename, options);
    const mailOptions ={
        from: `Delicious Store APP <noreply@delstore.com>`,
        to: options.user.email,
        subject: options.user.subject,
        html,
        text: 'fill'
    }
    //promisify sending mail
    const sendMail = promsify(transport.sendMail, transport);
    return sendMail(mailOptions);

}