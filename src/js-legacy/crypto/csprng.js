const crypto = require('crypto')

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';


const bin2val = (chunk, base) => {
  let sum = 0
  let l = chunk.length
  while (l--) {
    sum += chunk[l] * Math.pow(base, chunk.length - (l + 1))
  }
  return sum
}

class Stream {
  constructor(bytes) {
    this.binary = []

    let i = 0
    while (i < bytes.length) {
      this.binary = [
        ...this.binary,
        ...bytes.readUInt8(i)
          .toString(2)
          .padStart(8, '0')
          .split('')
          .map((n) => +n)
      ]
      i++
    }

    this.__base = { '2': this.binary }
  }

  generate(n, base, inner) {
    base = base || 2
  
    let val = n
    let k = Math.ceil(Math.log(n) / Math.log(base))
    let r = Math.pow(base, k) - n
    let chunk = null;
  
    while (val >= n) {
      chunk = this.__shift(base, k)
      if (!chunk) return inner ? n : null

      val = bin2val(chunk, base)
  
      if (val >= n) {
        if (r === 1) continue
        this.__push(r, val - n)
        val = this.generate(n, r, true)
      }
    }

    return val
  }

  __push(base, value) {
    this.__base[base] = this.__base[base] || []
    this.__base[base].push(value)
  }

  __shift(base, k) {
    let list = this.__base[base]
    if (!list || list.length < k) {
      return null
    } else {
      return list.splice(0, k)
    }
  }
}

class CSPRNG {
  static generateToken() {
    const n = 16
    const bytes = 32

    const stream = new Stream(crypto.randomBytes(bytes))

    let i = n
    let r = ''
    while (i--) {
      r += DIGITS[stream.generate(n)]
    }
    
    return r
  }
}

module.exports.Stream = Stream
module.exports.CSPRNG = CSPRNG