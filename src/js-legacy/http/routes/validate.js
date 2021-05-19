const fp = require('fastify-plugin')

module.exports = fp(function(app, opts, done) {
  app.get('/validate/', async function(req, repl) {
    console.log(req.headers)
    
    repl.header('x_vouch_user', 'john doe')
    repl.code(401)
    repl.type('text/plain')
    
    return ''
  })
  
  done()
})