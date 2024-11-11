/** @format */

const jwt = require("jsonwebtoken");
const { isTokenValid, attachCookieToReponse } = require("../utils/jwt");
const CustomError = require("../errors/index");
const Token = require("../Model/Token");

const authentication = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  const accessToken =
    authHeader && authHeader.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : null;
  const refreshToken = req.headers["x-refresh-token"];
  console.log(refreshToken);
  try {
    if (accessToken) {
      try {
        const { payload } = isTokenValid(accessToken);
        if (!payload) {
          throw new CustomError.BadRequestError("Token không hợp lệ");
        }
        req.user = payload.user;
        return next();
      } catch (err) {
        if (err.name === "TokenExpiredError") {
          // Token đã hết hạn, tiếp tục kiểm tra refreshToken
          console.log("Access token đã hết hạn, kiểm tra refresh token");
        } else {
          // Token không hợp lệ
          throw new CustomError.BadRequestError("Token không hợp lệ");
        }
      }
    }
    if (refreshToken) {
      const { payload } = isTokenValid(refreshToken);
      const { user, refreshToken: rt } = payload;

      if (!user) {
        throw new CustomError.BadRequestError("Không tìm thấy người dùng");
      }
      const token = await Token.findOne({
        user: user.User_id,
        refereshToken: rt,
      });

      if (token) {
        const newAccessToken = jwt.sign({ user }, process.env.JWT_SECRET_KEY, {
          expiresIn: "15m",
        });
        res.setHeader("Authorization", `Bearer ${newAccessToken}`);
        req.user = user;
        return next();
      } else {
        throw new CustomError.BadRequestError("Xác thực thất bại, thử lại");
      }
    } else {
      throw new CustomError.BadRequestError("Không có token nào được cung cấp");
    }
  } catch (error) {
    throw new CustomError.AuthenticatedError(error);
  }
};

const AuthorizePermission = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new CustomError.AuthenticatedError("Bạn không có quyền truy cập");
    }
    return next();
  };
};

module.exports = {
  authentication,
  AuthorizePermission,
};
