const express = require('express')

const expressMiddleWare = router => {
  router.use('/static/media', express.static('./storybook-static/'))
}

module.exports = expressMiddleWare
