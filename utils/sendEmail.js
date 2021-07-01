const nodemailer = require('nodemailer');

const sendEmail = (options) => { 
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'rohitpahuja7878@gmail.com',
            pass: 'rohitpahuja78'
        }
    })

    const mailOptions = {
        from: 'rohitpahuja7878@gmail.com',
        to: options.to,
        subject: options.subject,
        html: options.text
    }

    transporter.sendMail(mailOptions, function(err, info) {
        if(err) {
            console.log(err)
        }
        else {
            console.log(info)
        }
    })
}

module.exports = sendEmail;