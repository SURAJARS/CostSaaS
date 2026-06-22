const User = require('../models/User');
const { generateToken } = require('../config/jwt');

class AuthService {
  async register(userData) {
    const user = new User(userData);
    await user.save();
    return user;
  }

  async login(email, password) {
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      throw new Error('User not found');
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new Error('Invalid password');
    }

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id, user.role);
    return { user, token };
  }

  async getUserById(userId) {
    return await User.findById(userId);
  }

  async updateUser(userId, updateData) {
    return await User.findByIdAndUpdate(userId, updateData, { new: true });
  }
}

module.exports = new AuthService();
