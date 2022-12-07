const mongoose = require('mongoose')

const url = process.env.MONGODB_URI

const validatePhoneNumber = (number) => {
    if (number.length < 8) {
        return false
    }
    let numberParts = number.split('-')
    if (numberParts.length !== 2) {
        return false
    }
    if (isNaN(numberParts[0]) || isNaN(numberParts[1])) {
        return false
    }
    if (numberParts[0].length <2 || numberParts[0].length > 3 ) {
        return false
    }
    return true
}

mongoose.connect(url)
    .then(result => {
        console.log('connected to MongoDB')
    })
    .catch(error => {
        console.log('error connecting to MongoDB:', error.message)
    })

const personSchema = new mongoose.Schema({
  name:  {
      type: String,
      minLength: 3,
      required: true
  },
  number: {
      type: String,
      validate: {
        validator: function(v) {
          return /\d{2,3}-\d+$/.test(v);
        },
        message: props => `${props.value} is not a valid phone number!`
      },
      required: [true, 'User phone number required']
    }
}).set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Person', personSchema)