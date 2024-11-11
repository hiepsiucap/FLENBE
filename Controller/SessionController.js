/** @format */
const { StatusCodes } = require("http-status-codes");
const Book = require("../Model/Book");
const Session = require("../Model/Session");
const FlashCard = require("../Model/FlashCard");
const User = require("../Model/User");
const CustomAPIError = require("../errors");
const CreateASesionController = async (req, res) => {
  const { user } = req;
  const { bookid, totalquestion } = req.body;
  if (!user?.User_id || !bookid || !totalquestion) {
    throw new CustomAPIError.BadRequestError("Vui lòng cung cấp đủ thông tin");
  }
  const finduser = await User.findById({ _id: user?.User_id });
  const findbook = await Book.findById({ _id: bookid });
  if (!finduser || !findbook || !totalquestion) {
    throw new CustomAPIError.BadRequestError("Vui lòng cung cấp đủ thông tin");
  }
  const session = await Session.create({
    user: user.User_id,
    book: bookid,
    totalquestion: totalquestion,
  });
  return res.status(StatusCodes.OK).json({ session });
};

const UpdateASessionController = async (req, res) => {
  const { user } = req;
  const { score, sessionid, listflashcard } = req.body;
  console.log(sessionid);
  console.log(listflashcard);
  const session = await Session.findOne({ _id: sessionid, user: user.User_id });
  if (!session || !score || session.status == "finish") {
    throw new CustomAPIError.BadRequestError("Lượt chơi không tồn tại");
  }
  await FlashCard.updateMultipleReviews(listflashcard);
  session.status = "finish";
  session.score = score;
  await session.save();
  const totalScore = await Session.getTodayTotalScore(user.User_id);
  res.status(StatusCodes.OK).json({ session, totalScore });
};
const GetScoreToday = async (req, res) => {
  const { user } = req;
  const totalScore = await Session.getTodayTotalScore(user.User_id);
  return res.status(StatusCodes.OK).json({ totalScore });
};
module.exports = {
  CreateASesionController,
  GetScoreToday,
  UpdateASessionController,
};
