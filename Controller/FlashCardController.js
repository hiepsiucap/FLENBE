/** @format */

const { StatusCodes } = require("http-status-codes");
const FlashCard = require("../Model/FlashCard");
const CustomAPIError = require("../errors");
const Book = require("../Model/Book");
const { getDefinitionAndExamples } = require("../utils/GetExample");
const GetAudio = require("../utils/GetAudio");
const CreateFlashCard = async (req, res) => {
  console.log(req.body);
  const { bookId, text, meaning, example, phonetic } = req.body;
  const { user } = req;
  // Validate required fields
  if (!bookId) {
    throw new CustomAPIError.BadRequestError("Please Provide BookID");
  }
  if (!text) {
    throw new CustomAPIError.BadRequestError("Please Provide Text");
  }
  if (!meaning) {
    throw new CustomAPIError.BadRequestError("Please Provide Meaning");
  }
  const book = await Book.findOne({ _id: bookId, user: user.User_id });
  if (!book) {
    throw new CustomAPIError.BadRequestError("Không tìm thấy sổ từ của bạn");
  }
  const temp = await FlashCard.find({ text, meaning, book: bookId });
  if (temp.length > 0) {
    throw new CustomAPIError.BadRequestError("Từ vựng đã ở trong sổ từ");
  }
  let imageUrl =
    "https://res.cloudinary.com/dhhuv7n0h/image/upload/v1729781651/English_1_ndeufk.png";

  try {
    const image = await fetch(
      `https://api.unsplash.com/search/photos?query=${text}&client_id=${process.env.ACCESS_KEY_FLASHCARD}&per_page=1`
    );

    if (image.ok) {
      const data = await image.json();
      if (
        data &&
        data.results &&
        data.results.length > 0 &&
        data.results[0]?.urls?.small
      ) {
        imageUrl = data.results[0].urls.small;
      }
    }
  } catch (error) {
    console.error("Error fetching image from Unsplash:", error);
    // Keep default image URL
  }

  const exam = await getDefinitionAndExamples(text, example);

  const flashcard = await FlashCard.create({
    book: bookId,
    text,
    meaning,
    explain: example,
    example: exam,
    phonetic,
    image: imageUrl,
  });

  return res.status(StatusCodes.OK).json({ flashcard });
};
const CheckSave = async (req, res) => {
  const { bookId, text, meaning } = req.body;
  const temp = await FlashCard.find({ text, meaning, book: bookId });

  if (temp.length > 0) {
    throw new CustomAPIError.BadRequestError("Từ đã có trong sổ từ");
  }
  return res.status(StatusCodes.OK).json({ msg: " thành công" });
};
const GetAllFlashCard = async (req, res) => {
  const { bookid } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!bookid) {
    throw new CustomAPIError.BadRequestError("Vui lòng cung cấp bookstore");
  }

  // Calculate skip value for pagination
  const skip = (parseInt(page) - 1) * parseInt(limit);

  // Get total count of flashcards for this book
  const total = await FlashCard.countDocuments({ book: bookid });

  // Get paginated flashcards
  const listcard = await FlashCard.find({ book: bookid })
    .skip(skip)
    .limit(parseInt(limit));

  return res.status(StatusCodes.OK).json({
    listcard,
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
};
const DeleteFlashCard = async (req, res) => {
  const { flashcardid } = req.params;
  const { user } = req;
  const flashcard = await FlashCard.findById({ _id: flashcardid }).populate(
    "book"
  );
  if (!flashcard || !flashcard?.book || user.User_id != flashcard.book.user) {
    throw new CustomAPIError.BadRequestError("Bạn ko thể delete được");
  }
  await flashcard.deleteOne();
  res.status(StatusCodes.OK).json({ msg: "Delete thành công" });
};
const GetFlashCardToday = async (req, res) => {
  const { id, total } = req.query;
  console.log(id);
  const startDay = new Date();
  startDay.setHours(0, 0, 0, 0);
  const endDay = new Date();
  endDay.setHours(23, 59, 59, 59);
  const book = await Book.find({ _id: id, user: req.user.User_id });
  if (!book) throw new Error("Sổ từ của bạn không tồn tại ");
  const listflashcard = await FlashCard.find({
    book: id,
    nextReviewed: {
      $lte: endDay,
    },
  }).limit(Number(total));

  return res.status(StatusCodes.OK).json({ listflashcard });
};
const ReadFlashCard = async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const flashcard = await FlashCard.findById({ _id: id }).populate("book");
  if (!flashcard || !flashcard?.book || user.User_id != flashcard.book.user) {
    throw new CustomAPIError.BadRequestError("Bạn ko thể đọc được từ này");
  }
  const pathaudio = await GetAudio(flashcard.text, flashcard.text);
  if (pathaudio) {
    try {
      res.set({
        "Content-Type": "audio/mpeg",
        "Accept-Ranges": "bytes",
        "Cache-Control": "public, max-age=3600",
      });
      res.sendFile(pathaudio, async (err) => {
        if (err) {
          return res.status(StatusCodes.OK).json({ msg: "Hệ thống đang lỗi" });
        }
        try {
          console.log(pathaudio);
          await fs.promises.unlink(pathaudio);
        } catch (err) {}
      });
      return;
    } catch (err) {
      res
        .status(StatusCodes.BAD_GATEWAY)
        .json({ msg: "Hệ thống đang gặp trục trặc" });
    }
  }
  return res
    .status(StatusCodes.BAD_GATEWAY)
    .json({ msg: "Hệ thống đang gặp trục tă" });
};
module.exports = {
  CreateFlashCard,
  GetAllFlashCard,
  DeleteFlashCard,
  ReadFlashCard,
  GetFlashCardToday,
  CheckSave,
};
