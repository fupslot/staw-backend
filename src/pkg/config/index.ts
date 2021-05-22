const boolTrue = ['True', 'true', '1']

export default {
  STORE_DB: process.env.STORE_DB || 'staw-dev',
  STORE_URL: process.env.STORE_URL || 'mongodb://db0.example.net:27017',
  
  STORE_LOGGER: boolTrue.includes(process.env.STORE_LOGGER || '') || false
}