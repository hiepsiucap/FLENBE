/** @format */

const { StatusCodes } = require("http-status-codes");
const User = require("../Model/User");

const GetAllUser = async (req, res) => {
  console.log("Hello");
  const listuser = await User.find({});
  return res.status(StatusCodes.OK).json({ listuser });
};
const GetTopYear = async (req, res) => {
  const { user } = req;
  const users = await User.find({})
    .sort({ totalscore: -1 })
    .select("name ava totalscore level_description ");
  const currentuser = await User.find({ _id: user.User_id });
  const ranking = users.findIndex((u) => u._id.toString() === user.User_id) + 1;
  const listuser = users.slice(0, 8);
  return res
    .status(StatusCodes.OK)
    .json({ listuser, total: currentuser.totalscore, ranking });
};
module.exports = { GetAllUser, GetTopYear };
