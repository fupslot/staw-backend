const fp = require('fastify-plugin')

function Routes() {
  const disabledDomains = [
    'www',
    'api'
  ]
  
  return fp(function(app, opts, done) {    
    app.use((req, rep, done) => {
      const hostname = req.hostname;

      if (hostname.indexOf('localhost') === 0) {
        return done(new Error(`Hostname ${hostname}. Expecting 3rd-level domain name`))
      }

      const siteId = hostname.split('.').shift()
      
      if (disabledDomains.includes(siteId)) {
        return done(new Error(`Domain ${hostname} not allowed`))
      }

      // Saving siteId for the later process
      req.siteId = siteId

      req.isAuthenticated = function isAuthenticated() {
        if (!req.heades['x-auth-identity'] && req.heades['x-auth-identity'] !== '') {
          return true
        }

        return false
      }

      done()
    })
    
    // Routes
    app.register(require('./token'))
    app.register(require('./validate'))
    
    
    done()
  })
}

module.exports.Routes = Routes