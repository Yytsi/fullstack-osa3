require('dotenv').config()
const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const Person = require('./models/person')
const person = require('./models/person')

app.use(express.json())
app.use(cors())
app.use(express.static('dist'))
app.use(morgan('tiny'))

let persons = [
    { name: 'Arto Hellas', number: '040-123456', id: 1 },
    { name: 'Ada Lovelace', number: '39-44-5323523', id: 2 },
    { name: 'Dan Abramov', number: '12-43-234345', id: 3 },
    { name: 'Mary Poppendick', number: '39-23-6423122', id: 4 }
]

morgan.token('post-data', (req, res) => {
    if (req.method === 'POST') {
        return JSON.stringify(req.body)
    }
})

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :post-data'))

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
    Person.find({}).then(result => {
        res.json(result)
    }).catch(error => {
        console.log('error happened while getting persons', error)
        res.status(500).end()
    })
})

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    persons = persons.filter(person => person.id !== id)
    
    res.status(204).end()
})

app.post('/api/persons', (req, res) => {
    const { name, number } = req.body

    if (!name || !number) {
        return res.status(400).json({ error: 'Name or number field is missing' })
    }

    const newPerson = new Person({
        name,
        number
    })

    newPerson.save().then(savedPerson => {
        res.json(savedPerson)
    }).catch(error => {
        console.log(error)
        res.status(400).json({ error: 'Failed to save person' })
    })
})

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id)
    const person = persons.find(p => p.id === id)

    if (person) {
        res.json(person)
    } else {
        res.status(404).end()
    }
})

app.use((req, res) => {
    res.status(404).json({ error: 'Unknown request' })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`)
})