const mongoose = require('mongoose');
const Card = require('../models/card');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

const getCards = async (_req, res, next) => {
  try {
    const cards = await Card.find({}).lean();
    return res.json(cards);
  } catch (err) {
    return next(err);
  }
};

const createCard = async (req, res, next) => {
  try {
    const { name, link } = req.body;
    const owner = req.user && req.user._id;

    if (!owner || !mongoose.isValidObjectId(owner)) {
      return next(new ForbiddenError('Se requiere autorización'));
    }

    const created = await Card.create({ name, link, owner });
    return res.status(201).json(created);
  } catch (err) {
    return next(err);
  }
};

const deleteCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;

    if (!mongoose.isValidObjectId(cardId)) {
      return next(new BadRequestError('ID de tarjeta inválido'));
    }

    const card = await Card.findById(cardId).orFail().lean();

    if (String(card.owner) !== String(req.user._id)) {
      return next(new ForbiddenError('No tiene permiso para eliminar esta tarjeta'));
    }

    await Card.deleteOne({ _id: cardId });

    return res.status(200).json(card);
  } catch (err) {
    return next(err);
  }
};

const likeCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user && req.user._id;

    if (!mongoose.isValidObjectId(cardId) || !mongoose.isValidObjectId(userId)) {
      return next(new BadRequestError('ID inválido'));
    }

    const card = await Card.findByIdAndUpdate(
      cardId,
      { $addToSet: { likes: userId } },
      { new: true }
    )
      .orFail()
      .lean();

    return res.json(card);
  } catch (err) {
    return next(err);
  }
};

const dislikeCard = async (req, res, next) => {
  try {
    const { cardId } = req.params;
    const userId = req.user && req.user._id;

    if (!mongoose.isValidObjectId(cardId) || !mongoose.isValidObjectId(userId)) {
      return next(new BadRequestError('ID inválido'));
    }

    const card = await Card.findByIdAndUpdate(
      cardId,
      { $pull: { likes: userId } },
      { new: true }
    )
      .orFail()
      .lean();

    return res.json(card);
  } catch (err) {
    return next(err);
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
