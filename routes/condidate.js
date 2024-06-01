const express = require("express")
router = express.Router()
const CondidateController = require('../controller/condidate')
const requireAuthentication = require("../passport/index.js").authenticateUser

router.post('/create-new-condidate', requireAuthentication, CondidateController.createNewCondidate)
router.post('/update-condidate-details', requireAuthentication, CondidateController.updateCondidateDetails)
router.post('/delete-condidate', requireAuthentication, CondidateController.deleteCondidate)
router.get('/get-condidate', requireAuthentication, CondidateController.getCondidate)
router.get('/get-voted-users', requireAuthentication, CondidateController.getVotedUsers)
router.get('/get-count', requireAuthentication, CondidateController.getCounts)

module.exports = router;