const { request, response } = require('express')
const { DateTime } = require('luxon')

const { serverErrorHandler } = require('../helpers')
const cloudinary = require('cloudinary').v2
cloudinary.config(process.env.CLOUDINARY_URL)

const { Article, Career, Cohort, Course, Novelty, User } = require('../models')

const updateImg = async (req = request, res = response) => {
  try {
    const { collection, id } = req.params

    let model

    switch (collection) {
      case 'articles':
        model = await Article.findById(id)
        if (!model) {
          return notFoundException('artículo', id, res)
        }
        break

      case 'careers':
        model = await Career.findById(id)
        if (!model) {
          return notFoundException('carrera', id, res)
        }
        break

      case 'courses':
        model = await Course.findById(id)
        if (!model) {
          return notFoundException('curso', id, res)
        }
        break

      case 'cohorts':
        model = await Cohort.findById(id)
        if (!model) {
          return notFoundException('cohorte', id, res)
        }
        break

      case 'novelties':
        model = await Novelty.findById(id)
        if (!model) {
          return notFoundException('noticia', id, res)
        }
        break

      case 'users':
        model = await User.findById(id)
        if (!model) {
          return notFoundException('usuario', id, res)
        }
        break

      default:
        return res.status(500).json({
          msg: `Por validar la colección '${collection}'`,
        })
    }

    if (model.img) {
      const nameArr = model.img.split('/')
      const name = nameArr[nameArr.length - 1]
      const [public_id] = name.split('.')
      cloudinary.uploader.destroy(public_id)
    }

    const { tempFilePath } = req.files.file
    const { secure_url } = await cloudinary.uploader.upload(tempFilePath)

    model.img = secure_url
    model.updatedAt = DateTime.now()

    await model.save()

    res.json({ model })
  } catch (error) {
    serverErrorHandler(error, res)
  }
}

const notFoundException = (modelo = '', id = '', res = response) => {
  return res.status(400).json({
    msg: `No existe un modelo '${modelo}' con el id '${id}'`,
  })
}

module.exports = {
  updateImg,
}
