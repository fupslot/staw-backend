const fp = require('fastify-plugin')
const { CSPRNG } = require('../../crypto/csprng')

module.exports = fp(function(app, opts, done) {
  app.post('/api/token/', async function(req) {
    if (!req.headers['x-auth-identity']) {
      return new Error('Unauthorized!');
    }
    
    const tokenObject = {
      "tenantId": "safervpn", // todo - req.ctx.tenantId
      "url": "https://safervpn.perimeter81.com",
      "token": CSPRNG.generateToken()
    }

    const token = Buffer.from(JSON.stringify(tokenObject), 'utf8').toString('base64')
    req.ctx.emit('new_token', token)
    
    return { "token": token }
  })
  
  done()
})