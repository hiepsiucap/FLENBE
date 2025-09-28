/** @format */

const { StatusCodes } = require("http-status-codes");
const CustomAPIError = require("../errors");
const Book = require("../Model/Book");
const Session = require("../Model/Session");
const CreateBook = async (req, res) => {
  try {
    const { user } = req;

    // Get name from body, handle both "name" and "name " (with space)
    const bookName = req.body["name"] || req.body["name "];

    if (!bookName || !req.file) {
      throw new CustomAPIError.BadRequestError(
        "Vui lòng điền đầy đủ thông tin"
      );
    }

    const book = await Book.create({
      user: user.User_id,
      ava: req.file.path,
      name: bookName,
    });

    const session = await Session.create({
      user: user.User_id,
      book: book._id,
      totalquestion: 0,
    });

    return res.status(StatusCodes.OK).json({ book });
  } catch (error) {
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).json({
      error: error.message,
    });
  }
};
const GetBookByUser = async (req, res) => {
  const { user } = req;

  const listbook = await Session.getBooksWithSessionAndCards(user.User_id);
  return res.status(StatusCodes.OK).json({ listbook });
};
module.exports = { CreateBook, GetBookByUser };
