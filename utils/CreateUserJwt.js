/** @format */

const CreateUser = (user) => {
  return {
    name: user.name,
    email: user.email,
    User_id: user._id,
    role: user.role,
    ava: user.ava,
  };
};
module.exports = CreateUser;
