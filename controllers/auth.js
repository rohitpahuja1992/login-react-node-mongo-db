const User = require('../models/User')
const ErrorResponse = require('../utils/errorResponse');
const sendEmail = require('../utils/sendEmail');
const crypto = require('crypto');

exports.register = async (req, res, next) => {
    const {username, email, password} = req.body;

    try {
        const user = await User.create({
            username, email, password
        });
        sendToken(user, 201, res);
    } catch (error) {
        next(error);
    }
};

exports.login = async (req, res, next) => {
    const {email, password} = req.body;
    if(!email || !password) {
        return next(new ErrorResponse("please provide email and password", 400));
    }

    try {
        const user = await User.findOne({ email }).select("+password");

        if(!user) {
            return next(new ErrorResponse("Invalid credentials", 401));
        }
    
        const isMatch = await user.matchPasswords(password);

        if(!isMatch) {
            return next(new ErrorResponse("Invalid credentials", 401));
        }
        sendToken(user, 200, res);
    }
    catch(error) {
        next(error);
    }
};

exports.forgotpassword = async (req, res, next) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({email});
        if(!user) {
            return next(new ErrorResponse("email not sent",404));
        }
        const resetToken = user.getResetPasswordToken();

        await user.save();

        const resetUrl = `http://localhost:4554/passwordreset/${resetToken}`;
        const message = `
        <h1> you have requested  a password reset </h1>
        <p>please go to this link to reset your password</p>
        <a href=${resetUrl} clicktracking=off>${resetUrl}</a>
        `

        try {
            await sendEmail({
                to: user.email,
                subject: "password reset request",
                text: message
            });
            res.status(200).json({
                success: true,
                data: 'Email sent'
            });
        } catch (error) {
            user.resetPasswordToken=undefined;
            user.resetPasswordExpire=undefined;

            await user.save();

            return next(error)
            
        }
    } catch (error) {
        next(error);
    }
};

exports.resetpassword = async (req, res, next) => {
    const resetPasswordToken = crypto.createHash("sha256").update(req.params.resetToken).digest("hex");
    try {
        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt : Date.now() }
        })
        if(!user) {
            return next(new ErrorResponse("Invalid reset token", 400))
        }

        user.password = req.body.password;
        user.resetPasswordToken=undefined;
        user.resetPasswordExpire=undefined;

        await user.save();

        res.status(201).json({
            success: true,
            data: "password reset success"
        })
    } catch (error) {
        next(error);
    }
};

const sendToken = (user, statusCode, res) => {
    const token = user.getSignedToken();
    res.status(statusCode).json({
        success: true,
        token
    })
}