/** @format */

require("dotenv").config();
const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const createAccessToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "15m",
  });
  return token;
};
const createRefreshToken = (payload) => {
  const token = jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
  return token;
};
const isTokenValid = (token) => jwt.verify(token, process.env.JWT_SECRET_KEY);
const attachCookieToReponse = ({ res, user, refreshToken }) => {
  const accessTokenJWT = createAccessToken({ payload: { user } });
  const refreshTokenJWT = createRefreshToken({
    payload: { user, refreshToken },
  });
  const oneDay = 1;
  const longerExp = 1000 * 60 * 60 * 24 * 30;

  res.setHeader("Authorization", `Bearer ${accessTokenJWT}`);
  res.setHeader("x-refresh-token", refreshTokenJWT);
};
module.exports = {
  attachCookieToReponse,
  isTokenValid,
};
