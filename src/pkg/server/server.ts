import express from 'express'

interface HTTPServer {
  listen: (port: number, cb: () => void ) => void
}

export const server = (): HTTPServer => {
  const app  = express();

  // Define global middlewares


  app.get('/api/v1', (req, res) => res.sendStatus(200)) // simple healthcheck

  return {
    listen: (port, cb) => {
      app.listen(port, cb)
    }
  }
}