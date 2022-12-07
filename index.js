require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const Person = require('./models/person')

const app = express()
app.use(express.json())
app.use(express.static('client-app'))

app.use(cors())

const requestBodyParseErrorHandler = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error(err);
    return res.status(400).send({ status: 404, message: err.message }); // Bad request
  }
  next();
}
app.use(requestBodyParseErrorHandler);

morgan.token('body', function (req, res) { return JSON.stringify(req.body) })
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))



const validatePerson = async (person) => {
  const error = {
    ...((!person || !person.name) && {name:'name required'}),
    ...((await personExists(person.name)) && {name:'name must be unique'}),
    ...((!person || !person.number) && {number:'number required'})
  }
  if (Object.keys(error).length === 0) {
    return null
  } else {
    return error
  }
}

const personExists = async (name) => {
  const found = await Person.exists({name : name}) 
  if (found === null) {
    return false
  } else {
    return true
  }
}

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => {
    response.json(result)
  })
  
})

app.get('/api/persons/:id', (request, response, next) => {
    Person.findById(request.params.id)
      .then(result => {
        if (!result) {
          response.status(404).end()
        } else {
          response.json(result)
        }
      })
      .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  let person = request.body
  validatePerson(person)
    .then(error => {
      if (error) {
        response
          .status(400)
          .json(error)
      } else {
        const newPerson = new Person({
          name: person.name,
          number: person.number
        }).save().then(result => {
          response.json(result)
        })
      }
    })
    .catch(error => next(error))
})

app.put('/api/persons', (request, response, next) => {
  let person = request.body
  if(!person || !person.id || !person.number) {
    const error = {
      ...((!person || !person.id) && {id:'id required'}),
      ...((!person || !person.number) && {number:'number required'})
    }
    response.status(400).json(error)
  } else {
    Person.findOneAndUpdate({ id: person.id }, { number: person.number }, {runValidators:true})
      .then(result => {
        response.json(person)
      }).catch(error => next(error))
    }  
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.deleteOne({id: request.params.id})
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.get('/info', (request, response) => {
  const date = new Date();
  Person.find({}).then(result => {
    response.send(`<p>Phonebook has info for ${result.length} people</p><p>${date.toUTCString()}</p>`)
  })
  
})

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError' && error.kind === 'ObjectId') {
    response.status(400).json({id : 'id must be of valid object id'})
  } else if (error.name === 'ValidationError') {
    response.status(400).json({error : error.message})
  } else {
    response.status(500).end()
  }
  next(error)
}
app.use(errorHandler)


const PORT = process.env.PORT
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})