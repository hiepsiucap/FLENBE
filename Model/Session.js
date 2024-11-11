/** @format */

const mongoose = require("mongoose");
const User = require("./User");
const SeesionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Types.ObjectId,
      ref: "User",
      required: true,
    },
    score: {
      type: Number,
    },
    book: {
      type: mongoose.Types.ObjectId,
      ref: "Book",
      required: true,
    },
    totalquestion: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["pending", "finish"],
      default: "pending",
    },
    lastStreakUpdate: {
      type: Date,
      default: function () {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
      },
    },
  },
  {
    timestamps: true,
  }
);
SeesionSchema.pre("save", async function () {
  console.log("pre" + this);
  if (this.isNew) return;
  const user = await User.findById({ _id: this.user });
  if (user) {
    user.totalscore += this.score;
    if (user.totalscore < 100000) {
      user.level_description = "Newbie";
    } else if (user.totalscore < 3000000) {
      user.level_description = "Explorer";
    } else if (user.totalscore < 600000) {
      user.level_description = "Apprentice	";
    } else if (user.totalscore < 800000) {
      user.level_description = "Challenger";
    } else {
      user.level_description = "Navigator";
    }
    const today = new Date();
    const startDay = new Date(today.setHours(0, 0, 0, 0));
    const endDay = new Date(today.setHours(23, 59, 59, 900));
    const dailySessions = await this.constructor.find({
      user: this.user,
      createdAt: {
        $gte: startDay,
        $lte: endDay,
      },
    });
    const DailyTotalScore =
      dailySessions.reduce((total, session) => total + session.score, 0) +
      this.score;
    if (DailyTotalScore >= user.scoreADay) {
      if (user.lastStreakUpdate && user.lastStreakUpdate < startDay) {
        user.streak = (user.streak || 0) + 1;
        user.lastStreakUpdate = today;
      }
    }
    await user.save();
  }
});
SeesionSchema.statics.getTodayTotalScore = async function (userId) {
  const today = new Date();
  const startDay = new Date(today.setHours(0, 0, 0, 0));
  const endDay = new Date(today.setHours(23, 59, 59, 999));
  console.log(userId);
  const totalScore = await this.aggregate([
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
        createdAt: {
          $gte: startDay,
          $lte: endDay,
        },
      },
    },
    {
      $group: {
        _id: null,
        totalScore: { $sum: "$score" },
      },
    },
  ]);
  console.log(totalScore);
  return totalScore.length > 0 ? totalScore[0].totalScore : 0;
};
SeesionSchema.statics.getBooksWithSessionAndCards = async function (userId) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const sessions = await this.aggregate([
    // Match sessions for the specific user
    {
      $match: {
        user: new mongoose.Types.ObjectId(userId),
      },
    },

    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $group: {
        _id: "$book",
        lastSessionDate: { $first: "$createdAt" },
      },
    },
    {
      $lookup: {
        from: "books",
        localField: "_id",
        foreignField: "_id",
        as: "bookDetails",
      },
    },
    // Unwind the bookDetails array
    {
      $unwind: "$bookDetails",
    },
    {
      $lookup: {
        from: "flashcards",
        let: { bookId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  { $eq: ["$book", "$$bookId"] },
                  { $lt: ["$nextReviewed", tomorrow] },
                ],
              },
            },
          },
        ],
        as: "dueCards",
      },
    },
    // Project the final format
    {
      $project: {
        book: "$bookDetails",
        lastSession: {
          _id: "$lastSessionId",
          date: "$lastSessionDate",
          score: "$lastScore",
          status: "$lastStatus",
        },
        dueCardsCount: { $size: "$dueCards" },
      },
    },
    // Sort by last session date
    {
      $sort: {
        "lastSession.date": -1,
      },
    },
  ]);

  return sessions;
};
module.exports = mongoose.model("Session", SeesionSchema);
