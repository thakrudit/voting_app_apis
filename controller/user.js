const sequelize = require('sequelize');
const db = require('../models')
const helper = require('../config/helper')
const bcrypt = require('bcryptjs');
const randomstring = require("randomstring")
const jwt = require('jsonwebtoken')

const User = db.users;
const Condidate = db.condidate;
const Votes = db.voted_users;

User.hasOne(Votes, { foreignKey: 'user_id' })


module.exports = {
    signUp: async (req, res) => {
        try {
            const required = {
                name: req.body.name,
                image: req.body.image,
                age: req.body.age,
                email: req.body.email,
                mobile: req.body.mobile,
                address: req.body.address,
                aadhar_no: req.body.aadhar_no,
                voter_id: req.body.voter_id,
                password: req.body.password
            }
            const non_required = {
                role: req.body.role,
                is_voted: req.body.is_voted
            }
            const requestedData = await helper.validateObject(required, non_required)

            const user_data = await User.findOne({ where: { role: 1 } })
            if (requestedData.role === 1 && user_data) {
                return helper.error(res, 'Admin User Already Exist')
            }

            const existingUser = await User.findOne({ where: { email: requestedData.email } });
            if (!!existingUser) {
                return helper.error(res, "Email Already Exist");
            }

            if (!/^\d{10}$/.test(requestedData.mobile)) {
                return helper.error(res, 'Mobile Number must be exactly 10 digits')
            }
            if (!/^\d{12}$/.test(requestedData.aadhar_no)) {
                return helper.error(res, 'Aadhar Card Number must be exactly 12 digits')
            }
            if (!/^\d{8}$/.test(requestedData.voter_id)) {
                return helper.error(res, 'Voter ID must be exactly 8 digits')
            }

            const check_aadhar = await User.findOne({ where: { aadhar_no: requestedData.aadhar_no } })
            if (check_aadhar) {
                return helper.error(res, 'Aadhar card already Exist')
            }
            const check_voter_id = await User.findOne({ where: { voter_id: requestedData.voter_id } })
            if (check_voter_id) {
                return helper.error(res, 'Voter ID already Exist')
            }

            // Hash Password
            const salt = 10;
            const hashPassword = await bcrypt.hash(requestedData.password, salt);
            let otp = randomstring.generate({ length: 6, charset: 'numeric' })

            const data = await User.create({
                name: requestedData.name,
                age: requestedData.age,
                image: requestedData.image,
                email: requestedData.email,
                mobile: requestedData.mobile,
                address: requestedData.address,
                aadhar_no: requestedData.aadhar_no,
                voter_id: requestedData.voter_id,
                password: hashPassword,
                role: requestedData.role,
                is_voted: requestedData.is_voted,
                otp: otp
            })

            // Create Token
            const credentials = { id: data.id, email: data.email };
            const token = jwt.sign({ data: credentials }, process.env.JWT_SECRET);

            const body = {
                token: token,
                data: data
            }

            return helper.success(res, 'User Created Successfully', body)


        } catch (error) {
            return helper.error(res, error)
        }
    },

    logIn: async (req, res) => {
        try {
            const required = {
                email: req.body.email,
                password: req.body.password
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const user = await User.findOne({ where: { email: requestedData.email } })
            if (!user) {
                return helper.error(res, 'Email is Invalid')
            }
            const compPassword = await bcrypt.compare(requestedData.password, user.password);
            if (!compPassword) {
                return helper.error(res, 'Incorrect Password');
            }

            let otp = randomstring.generate({ length: 6, charset: 'numeric' });
            if (user.is_verified === 0) {
                user.otp = otp
                user.save();
            }

            // Generate Token
            const credentials = { id: user.id, email: user.email };
            const token = jwt.sign({ data: credentials }, process.env.JWT_SECRET);

            const body = {
                token: token,
                user: user
            }

            return helper.success(res, 'LogIn Successfully', body);

        } catch (error) {
            return helper.error(res, error)
        }
    },

    changePassword: async (req, res) => {
        try {
            const required = {
                user_id: req.user.id,
                old_password: req.body.old_password,
                new_password: req.body.new_password
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required);

            const user = await User.findOne({ where: { id: requestedData.user_id } })
            // if (!user) {
            //     return helper.error(res, 'user not found')
            // }

            const compPassword = await bcrypt.compare(requestedData.old_password, user.password)
            if (!compPassword) {
                return helper.error(res, "Old Password does't match")
            }
            const salt = 10;
            const hashPassword = await bcrypt.hash(requestedData.new_password, salt)

            const compNewPassword = await bcrypt.compare(requestedData.new_password, user.password)
            if (compNewPassword) {
                return helper.error(res, "New Password is same as Old Password")
            }

            user.password = hashPassword;
            user.save();
            return helper.success(res, 'Password Changed')


        } catch (error) {
            return helper.error(res, error)
        }
    },

    myProfile: async (req, res) => {
        try {
            const required = {
                user_id: req.user.id
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const user = await User.findOne({ where: { id: requestedData.user_id } })
            // if (!user) {
            //     return helper.error(res, 'User can not match');
            // }
            return helper.success(res, "Getting User Profile Successfully", user)

        } catch (error) {
            return helper.error(res, error)
        }
    },

    editProfile: async (req, res) => {
        try {
            const required = {
                user_id: req.user.id,
                name: req.body.name,
                image: req.body.image,
                age: req.body.age,
                email: req.body.email,
                mobile: req.body.mobile,
                address: req.body.address,
                aadhar_no: req.body.aadhar_no,
                voter_id: req.body.voter_id,
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const user = await User.findOne({ where: { id: requestedData.user_id } })

            const check_email = await User.findOne({ where: { email: requestedData.email } })

            console.log(check_email + "+++++++++++")
            if (!!check_email) {
                return helper.error(res, "Email Already Exist");
            }

            if (!/^\d{10}$/.test(requestedData.mobile)) {
                return helper.error(res, 'Mobile Number must be exactly 10 digits')
            }
            if (!/^\d{12}$/.test(requestedData.aadhar_no)) {
                return helper.error(res, 'Aadhar Card Number must be exactly 12 digits')
            }
            if (!/^\d{8}$/.test(requestedData.voter_id)) {
                return helper.error(res, 'Voter ID must be exactly 8 digits')
            }

            const check_aadhar = await User.findOne({ where: { aadhar_no: requestedData.aadhar_no } })
            if (check_aadhar) {
                return helper.error(res, 'Aadhar card already Exist')
            }
            const check_voter_id = await User.findOne({ where: { voter_id: requestedData.voter_id } })
            if (check_voter_id) {
                return helper.error(res, 'Voter ID already Exist')
            }


            user.name = requestedData.name
            user.image = requestedData.image
            user.age = requestedData.age
            user.email = requestedData.email
            user.mobile = requestedData.mobile
            user.address = requestedData.address
            user.aadhar_no = requestedData.aadhar_no
            user.voter_id = requestedData.voter_id
            user.save();

            return helper.success(res, "Profile Edited Successfully", user)

        } catch (error) {
            return helper.error(res, error)
        }
    },

    otpVerify: async (req, res) => {
        try {
            const required = {
                email: req.body.email,
                otp: req.body.otp
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required);

            const user = await User.findOne({ where: { email: requestedData.email } })
            if (!user) {
                return helper.error(res, 'Email not found')
            }

            if (user.otp != requestedData.otp) {
                return helper.error(res, 'Incorrect OTP')
            }
            user.is_verified = 1
            user.save();
            return helper.success(res, "OTP Verified")

        } catch (err) {
            return helper.error(res, err)
        }
    },

    forgetPassword: async (req, res) => {
        try {
            const required = {
                email: req.body.email,
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required);

            const user = await User.findOne({ where: { email: requestedData.email } })
            if (!user) {
                return helper.error(res, 'Email not found')
            }
            let otp = randomstring.generate({ length: 6, charset: 'numeric' });
            user.is_verified = 0
            user.otp = otp
            user.save();

            return helper.success(res, "Otp sent successfully")
        } catch (error) {
            return helper.error(res, err)
        }
    },

    resendOtp: async (req, res) => {
        try {
            const required = {
                email: req.body.email,
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required);

            const user = await User.findOne({ where: { email: requestedData.email } })
            if (!user) {
                return helper.error(res, 'Email not found')
            }

            let otp = randomstring.generate({ length: 6, charset: 'numeric' });
            user.otp = otp
            user.save();
            return helper.success(res, 'Otp Resent')

        } catch (error) {
            return helper.error(res, error)
        }
    },

    resetPasssword: async (req, res) => {
        try {
            const required = {
                email: req.body.email,
                new_password: req.body.new_password
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required);

            const user = await User.findOne({ where: { email: requestedData.email } })
            if (!user) {
                return helper.error(res, 'Email not found')
            }

            const salt = 10;
            const hashPassword = await bcrypt.hash(requestedData.new_password, salt)

            user.password = hashPassword
            user.save();
            return helper.success(res, 'Password Reset Successfully')
        } catch (error) {
            return helper.error(res, error)
        }

    },

    vote: async (req, res) => {
        try {
            const required = {
                user_id: req.user.id,
                condidate_id: req.body.condidate_id,
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required);

            const condidate = await Condidate.findOne({ where: { id: requestedData.condidate_id } })
            if (!condidate) {
                return helper.error(res, 'condidate not found')
            }

            const user = await User.findOne({ where: { id: requestedData.user_id } })
            
            if (user.role === 1) {
                return helper.error(res, 'Admin is not allowed to vote')
            }
            if (user.is_voted === 1) {
                return helper.error(res, 'User Already Voted')
            }

            const votes = await Votes.create({
                condidate_id: requestedData.condidate_id,
                user_id: requestedData.user_id
            })  

            condidate.vote_count++
            condidate.save();

            user.is_voted = 1
            await user.save();

            return helper.success(res, 'Voted Successfully', votes)

        } catch (error) {
            return helper.error(res, error)
        }
    },

}