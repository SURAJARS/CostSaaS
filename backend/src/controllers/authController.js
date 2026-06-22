const authService = require('../services/authService');
const { validateUser } = require('../validators');

class AuthController {
  async register(req, res, next) {
    try {
      const { error, value } = validateUser(req.body);
      if (error) {
        return res.status(400).json({ success: false, message: error.details[0].message });
      }

      // Check if user already exists
      const existingUser = await User.findOne({ $or: [{ email: value.email }, { username: value.username }] });
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'User already exists' });
      }

      const user = await authService.register(value);
      res.status(201).json({ success: true, message: 'User registered successfully', data: user });
    } catch (error) {
      next(error);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' });
      }

      const { user, token } = await authService.login(email, password);
      res.status(200).json({ success: true, message: 'Login successful', data: { user, token } });
    } catch (error) {
      if (error.message === 'User not found' || error.message === 'Invalid password') {
        return res.status(401).json({ success: false, message: 'Invalid email or password' });
      }
      next(error);
    }
  }

  async getProfile(req, res, next) {
    try {
      const user = await authService.getUserById(req.user._id);
      res.status(200).json({ success: true, data: user });
    } catch (error) {
      next(error);
    }
  }

  async updateProfile(req, res, next) {
    try {
      const { firstName, lastName, phone } = req.body;
      const user = await authService.updateUser(req.user._id, {
        firstName,
        lastName,
        phone,
        updatedAt: new Date()
      });
      res.status(200).json({ success: true, message: 'Profile updated successfully', data: user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AuthController();
