var DataTypes = require("sequelize").DataTypes;
var _condidate = require("./condidate");
var _users = require("./users");
var _voted_users = require("./voted_users");

function initModels(sequelize) {
  var condidate = _condidate(sequelize, DataTypes);
  var users = _users(sequelize, DataTypes);
  var voted_users = _voted_users(sequelize, DataTypes);


  return {
    condidate,
    users,
    voted_users,
  };
}
module.exports = initModels;
module.exports.initModels = initModels;
module.exports.default = initModels;
