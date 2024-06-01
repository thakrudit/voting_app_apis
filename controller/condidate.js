const helper = require("../config/helper")
const db = require('../models')

const User = db.users;
const Condidate = db.condidate;
const Votes = db.voted_users;

// User.hasOne(Condidate, { foreignKey: "user_id" })
Condidate.belongsTo(User, { foreignKey: 'user_id' });
Condidate.hasMany(Votes, { foreignKey: "condidate_id" })

module.exports = {
    createNewCondidate: async (req, res) => {
        try {
            const required = {
                id: req.user.id,
                user_id: req.body.user_id,
                party_name: req.body.party_name,
                party_flag: req.body.party_flag,
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required);

            const find_admin = await User.findOne({ where: { id: requestedData.id } })
            if (find_admin.role === 2 || find_admin.role === 3) {
                return helper.error(res, "Only Admin is allowed to Create new Condidate")
            }

            const user = await User.findOne({ where: { id: requestedData.user_id } })
            if (!user) {
                return helper.error(res, "User not Exist")
            }
            if (user.role === 3) {
                return helper.error(res, "This User is already Condidate")
            }
            if (user.age <= 35) {
                return helper.error(res, "User is not eligible for Condidate role")
            }

            const condidate_data = await Condidate.findOne({ where: { party_name: requestedData.party_name } })
            if (condidate_data) {
                return helper.error(res, "This party name already exist please choose another one")
            }

            const condidate = await Condidate.create({
                user_id: requestedData.user_id,
                party_name: requestedData.party_name,
                party_flag: requestedData.party_flag,
            })

            user.role = 3
            user.save();

            return helper.success(res, 'Adding New Condidate Successfully', condidate)

        } catch (error) {
            return helper.error(res, error)
        }
    },

    updateCondidateDetails: async (req, res) => {
        try {
            const required = {
                id: req.user.id,
                condidate_id: req.body.condidate_id,
                new_party_name: req.body.new_party_name,
                new_party_flag: req.body.new_party_flag,
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required);

            const find_admin = await User.findOne({ where: { id: requestedData.id } })
            if (find_admin.role === 2 || find_admin.role === 3) {
                return helper.error(res, 'Only Admin is allowed to Update Condidate Data')
            }

            const condidate = await Condidate.findOne({ where: { id: requestedData.condidate_id } })
            if (!condidate) {
                return helper.error(res, "Condidate Not Found")
            }
            const condidate_data = await Condidate.findOne({ where: { party_name: requestedData.new_party_name } })
            if (condidate_data) {
                return helper.error(res, "This party name already exist please choose another one")
            }

            condidate.party_name = requestedData.new_party_name
            condidate.party_flag = requestedData.new_party_flag
            condidate.save();

            return helper.success(res, "Condidate Updated Successfully", condidate)


        } catch (error) {
            return helper.error(res, error)
        }
    },

    deleteCondidate: async (req, res) => {
        try {
            const required = {
                id: req.user.id,
                condidate_id: req.query.condidate_id
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required);

            const find_admin = await User.findOne({ where: { id: requestedData.id } })
            if (find_admin.role === 2 || find_admin.role === 3) {
                return helper.error(res, 'Only Admin is allowed to Delete Condidate Data')
            }

            const condidate = await Condidate.findOne({ where: { id: requestedData.condidate_id } })
            if (!condidate) {
                return helper.error(res, 'Condidate Not Found')
            }
            condidate.destroy();

            const user = await User.findOne({ where: { id: condidate.user_id } })
            user.role = 2
            user.save()

            return helper.success(res, "Condidate Deleted Successfully")

        } catch (error) {
            return helper.error(res, error)
        }
    },

    getCondidate: async (req, res) => {
        try {
            const required = {
                id: req.user.id,
                condidate_id: req.query.condidate_id
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const find_admin = await User.findOne({ where: { id: requestedData.id } })
            if (find_admin.role === 2 || find_admin.role === 3) {
                return helper.error(res, 'Only Admin is allowed to Get Condidate Data')
            }

            const data = await Condidate.findOne({
                // attributes: ["party_name", "party_flag"],
                where: { id: requestedData.condidate_id },
                include: {
                    // attributes: ["name"],
                    model: User
                }
            })
            return helper.success(res, "", data)

        } catch (error) {
            return helper.error(res, error)
        }
    },

    getVotedUsers: async (req, res) => {
        try {
            const required = {
                id: req.user.id,
                condidate_id: req.query.condidate_id
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const find_admin = await User.findOne({ where: { id: requestedData.id } })
            if (find_admin.role === 2 || find_admin.role === 3) {
                return helper.error(res, "Only Admin is allowed to check the voted users of Condidate")
            }

            const data = await Condidate.findOne({
                where: { id: requestedData.condidate_id },
                include: {
                    attributes: ["user_id"],
                    model: Votes
                }
            })
            return helper.success(res, "", data)

        } catch (error) {
            return helper.error(res, error)
        }
    },

    getCounts: async (req, res) => {
        try {
            const required = {
                id: req.user.id,
                condidate_id: req.query.condidate_id
            }
            const non_required = {}
            const requestedData = await helper.validateObject(required, non_required)

            const find_admin = await User.findOne({ where: { id: requestedData.id } })
            if (find_admin.role === 2 || find_admin.role === 3) {
                return helper.error(res, "Only Admin is allowed to check the vote count of Condidate")
            }

            const data = await Condidate.findOne({ where: { id: requestedData.condidate_id } })

            return helper.success(res, "Total count is : ", data.vote_count)

        } catch (error) {
            return helper.error(res, error)
        }
    }
}