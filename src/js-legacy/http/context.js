const { EventEmitter } = require('events')

class Context extends EventEmitter {
  constructor() {
    super()
  }

  static Init() {
    return new Context()
  }
}



module.exports.Context = async function() {
  const ctx = await Context.Init()

  return Promise.resolve(ctx)
}