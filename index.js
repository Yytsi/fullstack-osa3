const express = require('express')
const app = express()

app.use(express.json())

let persons = [
    { name: 'Arto Hellas', number: '040-123456', id: 1 },
    { name: 'Ada Lovelace', number: '39-44-5323523', id: 2 },
    { name: 'Dan Abramov', number: '12-43-234345', id: 3 },
    { name: 'Mary Poppendick', number: '39-23-6423122', id: 4 }
]

app.get('/info', (req, res) => {
    res.send(`<p>Phonebook has info for ${persons.length} people</p><p>${new Date()}</p>`)
})

app.get('/api/persons', (req, res) => {
    res.json(persons)
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

    const newPerson = {
        name,
        number,
        id: Math.floor(Math.random() * 10000000)
    }

    persons.push(newPerson)
    res.status(201).json(newPerson)
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

const PORT = 3001
app.listen(PORT)