/** @format */

const mongoose = require("mongoose");
const Book = require("./Book");

const FlashCardSchema = new mongoose.Schema({
  book: {
    type: mongoose.Types.ObjectId,
    ref: Book,
    required: true,
  },
  text: {
    type: String,
    required: true,
  },
  meaning: {
    type: String,
    required: true,
  },
  phonetic: {
    type: String,
    default: "",
  },
  example: {
    type: String,
    default: "",
  },
  explain: {
    type: String,
    default: "",
  },
  box: {
    type: Number,
    required: true,
    default: 1,
  },

  image: {
    type: String,
    required: true,
    default: "",
  },
  lastReviewed: {
    type: Date,
    required: true,
    default: Date.now,
  },
  nextReviewed: {
    type: Date,
    required: true,
    default: Date.now,
  },
  correctCount: {
    type: Number,
    required: true,
    default: 0,
  },
  incorrectCount: {
    type: Number,
    required: true,
    default: 0,
  },
});
FlashCardSchema.index({ text: 1, meaning: 1 }, { unique: true });
FlashCardSchema.methods.updateReview = async function (iscorrect) {
  if (!iscorrect) {
    this.incorrectCount++;
    this.box = 1;
  } else {
    this.correctCount++;
    this.box = Math.min(this.box + 1, 5);
  }
  const interval = [1, 2, 5, 10, 20];
  const DaystoAdd = interval[this.box - 1];
  console.log("day to add" + DaystoAdd);
  this.nextReviewed = new Date(Date.now() + DaystoAdd * 24 * 60 * 60 * 1000);
  return await this.save();
};
FlashCardSchema.statics.updateMultipleReviews = async function (
  flashcardUpdates
) {
  console.log(flashcardUpdates);
  return Promise.all(
    flashcardUpdates.map(async ({ _id, iscorrect }) => {
      const flashcard = await this.findOne({ _id });
      console.log(flashcard);
      if (flashcard) {
        await flashcard.updateReview(iscorrect);
      }
    })
  );
};
FlashCardSchema.pre("save", async function () {
  if (this.isNew) {
    const book = await Book.findOne({ _id: this.book });
    if (Book) {
      book.numsofcard += 1;
      await book.save();
    }
  }
});
FlashCardSchema.pre("deleteOne", { document: true }, async function () {
  console.log(this.book);
  const book = await Book.findOne({ _id: this.book });
  if (book) {
    book.numsofcard -= 1;
    await book.save();
  }
});
FlashCardSchema.statics.findCard = function (BookId) {
  return this.find({
    book: BookId,
    nextReviewed: { $lte: new Date() },
  });
};
module.exports = mongoose.model("FlashCard", FlashCardSchema);
