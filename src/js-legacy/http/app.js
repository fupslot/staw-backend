const { fastify } = require('fastify')
const middle = require('middie')

const { Routes } = require('./routes')
const { Context } = require('./context')

async function App() {
  const app = fastify({
    logger : true,
    ignoreTrailingSlash: false
  })
  app.register(middle)

  
  const ctx = await Context();
  app.decorate('ctx', { getter: () => ctx })
  app.decorateRequest('ctx', { getter: () => ctx })
  app.register(Routes())

  return app;
}

module.exports.App = App