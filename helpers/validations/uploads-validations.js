const allowedCollections = [
  'articles',
  'careers',
  'cohorts',
  'courses',
  'novelties',
  'users',
]

const validateCollection = (collection = '') => {
  const include = allowedCollections.includes(collection)
  if (!include)
    throw new Error(
      `La colección '${collection}' no es permitida. Colecciones permitidas: ${allowedCollections.join(
        ', '
      )}`
    )
  return true
}

module.exports = {
  validateCollection,
}
