const mongoose = require('mongoose')

if (process.argv.length < 3) {
  console.log('Please provide the password as an argument: node mongo.js <password>')
  process.exit(1)
}

const password = process.argv[2]

const url =
  `mongodb+srv://alzech:${password}@cluster0.iw6zk.mongodb.net/phonebookApp?retryWrites=true&w=majority`
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
    id: mongoose.ObjectId,
  })
  
const Person = mongoose.model('Person', personSchema)
if(process.argv[3] !== undefined && process.argv[4] !== undefined) {
    const person = new Person({
        id: new mongoose.Types.ObjectId(),
        name: process.argv[3], 
        number: process.argv[4]
      })
    
      person.save().then(result => {
        console.log('saved!')
        mongoose.connection.close()
      })
} else {
    Person.find({}).then(result => {
        result.forEach(note => {
          console.log(note)
        })
        mongoose.connection.close()
      })
}
