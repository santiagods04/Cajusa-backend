const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const UnauthorizedError = require('../errors/UnauthorizedError');

const urlRegex = /^(https?:\/\/)(www\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)$/;
const DEFAULT_AVATAR = 'https://practicum-content.s3.us-west-1.amazonaws.com/resources/moved_avatar_1604080799.jpg';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      default: 'Jacques Cousteau',
      minlength: 2,
      maxlength: 30,
      trim: true,
    },

    about: {
      type: String,
      default: 'Explorador',
      minlength: 2,
      maxlength: 30,
      trim: true,
    },

    avatar: {
      type: String,
      default: DEFAULT_AVATAR,
      validate: {
        validator: (v) => urlRegex.test(v),
        message: 'URL de avatar inválida',
      },
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: 'Email inválido',
      },
    },

    password: {
      type: String,
      required: true,
      minlength: 8,
      select: false,
    },
  },
  { versionKey: false }
);

userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return Promise.reject(new UnauthorizedError('Correo o contraseña incorrectos'));
      }

      return bcrypt.compare(password, user.password).then((matched) => {
        if (!matched) {
          return Promise.reject(new UnauthorizedError('Correo o contraseña incorrectos'));
        }
        return user;
      });
    });
};

module.exports = mongoose.model('user', userSchema);
