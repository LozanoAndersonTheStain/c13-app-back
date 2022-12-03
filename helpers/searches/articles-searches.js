const { DateTime } = require('luxon')

const { Article, User } = require('../../models')
const { isObjectId } = require('../validate-object-id')
const { serverErrorHandler } = require('../server-error-handler')

const searchArticles = async (searchTerm = '', res = response) => {
  try {
    if (isObjectId(searchTerm)) {
      const article = await Article.findById(searchTerm).populate('user')

      return res.status(200).json({
        queriedFields: ['id'],
        results: article ? [article] : [],
      })
    }

    //2022-10-23
    const date = DateTime.fromFormat(searchTerm, 'yyyy-MM-dd').toUTC()
    if (!date.invalid) {
      const UTCCreatedAt = { date: '$createdAt', timezone: 'America/Bogota' }
      const UTCUpdatedAt = { date: '$updatedAt', timezone: 'America/Bogota' }
      const articles = await Article.find({
        $or: [
          {
            $expr: {
              $and: [{ $eq: [{ $year: UTCCreatedAt }, { $year: date }] }],
              $and: [{ $eq: [{ $month: UTCCreatedAt }, { $month: date }] }],
              $and: [
                { $eq: [{ $dayOfMonth: UTCCreatedAt }, { $dayOfMonth: date }] },
              ],
            },
          },
          {
            $expr: {
              $and: [{ $eq: [{ $year: UTCUpdatedAt }, { $year: date }] }],
              $and: [{ $eq: [{ $month: UTCUpdatedAt }, { $month: date }] }],
              $and: [
                { $eq: [{ $dayOfMonth: UTCUpdatedAt }, { $dayOfMonth: date }] },
              ],
            },
          },
        ],
        $and: [{ status: true }],
      }).populate('user')

      return res.status(200).json({
        queriedFields: ['createdAt', 'updatedAt'],
        quantity: articles.length,
        articles,
      })
    }

    if (searchTerm === 'true' || searchTerm === 'false') {
      const articles = await Article.find({
        status: searchTerm === 'true',
      }).populate('user')

      return res.status(200).json({
        queriedFields: [`status: ${searchTerm}`],
        quantity: articles.length,
        articles,
      })
    }

    const regex = new RegExp(searchTerm, 'i')

    const articles = await Article.find({
      title: regex,
      status: true,
    }).populate('user')

    res.status(200).json({
      queriedFields: ['title'],
      quantity: articles.length,
      articles,
    })
  } catch (error) {
    serverErrorHandler(error, res)
  }
}

const searchArticlesByUser = async (searchTerm = '', res = response) => {
  try {
    if (isObjectId(searchTerm)) {
      const article = await Article.find({ user: searchTerm }).populate('user')
      return res.status(200).json({
        queriedFields: ['user.id'],
        results: article ? [article] : [],
      })
    }

    const regex = new RegExp(searchTerm, 'i')
    const users = await User.find({
      $or: [{ firstName: regex }, { lastName: regex }, { username: regex }],
    })
    const usersIds = users.map((user) => user.id)

    const articles = await Article.find({
      user: {
        $in: usersIds,
      },
      status: true,
    }).populate('user')

    res.status(200).json({
      queriedFields: ['user.firstName', 'user.lastName', 'user.username'],
      quantity: articles.length,
      articles,
    })
  } catch (error) {
    serverErrorHandler(error, res)
  }
}

module.exports = {
  searchArticles,
  searchArticlesByUser,
}
