const bcrypt = require('bcryptjs');
const User = require('../models/user');
const jwt = require('jsonwebtoken');
const moongose = require('mongoose');
const BadRequestError = require('../errors/BadRequestError');

const { NODE_ENV, JWT_SECRET } = process.env;


const createUser = (req, res, next) => {
  const { name, about, avatar, email, password } = req.body;

  if (!password || password.length < 8) {
    return next(new BadRequestError('La contraseña debe tener al menos 8 caracteres'));
  }

  bcrypt.hash(password, 10)
    .then((hash) => User.create({ name, about, avatar, email, password: hash }))
    .then((user) => res.status(201).send({ _id: user._id, email: user.email }))
    .catch(next);
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign(
        { _id: user._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' }
      );
      res.send({ token });
    })
    .catch(next);
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).lean();
    res.json(users);
  } catch (err) {
      next(err);
    }
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .orFail()
    .then((user) => res.send(user))
    .catch(next);
};

const getUserById = async (req, res, next) => {
  try {
    const { userId } = req.params;

    if (!moongose.isValidObjectId(userId)) {
      return next(new BadRequestError('ID inválido'));
    }

    const user = await User.findById(userId).orFail().lean();
    return res.json(user);
  } catch (err) {
      return next(err);
    }
};

const updateUserProfile = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    if (!moongose.isValidObjectId(userId)) return next(new BadRequestError('ID inválido'));

    const { name, about } = req.body;
    const updated = await User.findByIdAndUpdate(
      userId,
      { name, about },
      { new: true, runValidators: true }
    ).orFail();

    res.json(updated);
  } catch (err) {
      next(err);
    }
};

const updateUserAvatar = async (req, res, next) => {
  try {
    const userId = req.user && req.user._id;
    if (!moongose.isValidObjectId(userId)) return next(new BadRequestError('ID inválido'));

    const { avatar } = req.body;
    const updated = await User.findByIdAndUpdate(
      userId,
      { avatar },
      { new: true, runValidators: true }
    ).orFail();

    res.json(updated);
  } catch (err) {
      next(err);
    }
};

module.exports = { createUser, login, getCurrentUser, getUsers, getUserById, updateUserProfile, updateUserAvatar };