const express = require('express')
const router = express.Router();
const AuthController = require('../controller/user.js')
const requireAuthentication = require("../passport/index.js").authenticateUser

router.post('/sign-up', AuthController.signUp)
router.post('/log-in', AuthController.logIn)
router.post('/change-password', requireAuthentication, AuthController.changePassword)
router.get('/my-profile', requireAuthentication, AuthController.myProfile)
router.post('/edit-profile', requireAuthentication, AuthController.editProfile)
router.post('/otp-verify', AuthController.otpVerify)
router.post('/forget-password', AuthController.forgetPassword)
router.post('/resend-otp', AuthController.resendOtp)
router.post('/reset-passsword', AuthController.resetPasssword)

router.post('/vote', requireAuthentication, AuthController.vote)

module.exports = router;
