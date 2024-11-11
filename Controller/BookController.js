/** @format */

const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors");
const Book = require("../Model/Book");
const Session = require("../Model/Session");
const CreateBook = async (req, res) => {
  const { user } = req;
  console.log(user);
  console.log(req.file);
  if (!req.body["name"] || !req.file) {
    throw new CustomAPIError.BadRequestError("Vui lòng điền đầy đủ thông tin");
  } else {
    const book = await Book.create({
      user: user.User_id,
      ava: req.file.path,
      name: req.body["name"],
    });
    const session = await Session.create({
      user: user.User_id,
      book: book._id,
      totalquestion: 0,
    });
    return res.status(StatusCodes.OK).json({ book });
  }
};
const GetBookByUser = async (req, res) => {
  const { user } = req;
  console.log(user);

  const listbook = await Session.getBooksWithSessionAndCards(user.User_id);
  return res.status(StatusCodes.OK).json({ listbook });
};
module.exports = { CreateBook, GetBookByUser };
