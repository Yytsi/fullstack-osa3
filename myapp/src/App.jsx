import { useState, useEffect } from 'react'
import personService from './services/persons'

const FilterForm = ({ filterName, setFilterName }) => {
  return (
    <div>
      filter shown with <input onChange={(e) => {
        setFilterName(e.target.value)
      }} value={filterName}/>
    </div>
  )
}

const AddButton = ({ persons, newName, newNumber, setPersons, setNewName, setNewNumber, showNotification }) => {
  return (
    <div>
      <button type="submit" onClick={(e) => {
        e.preventDefault()
        if (persons.find(person => person.name === newName)) {
          if (window.confirm(`${newName} is already added to phonebook, replace the old number with a new one?`)) {
            const personId = persons.find(person => person.name === newName).id
            setPersons(persons.map(person => person.id !== personId ? person : { ...person, number: newNumber }))
            personService.update(personId, { name: newName, number: newNumber }).then(() => {
              console.log("updated", newName, newNumber)
              showNotification(`Updated ${newName}`, true)
              setNewName('')
              setNewNumber('')
            }).catch(error => {
              console.log("error", error)
              showNotification(`Information of ${newName} has already been removed from server`, false)
              setPersons(persons.filter(person => person.id !== personId))
            })
          }
          return
        }

        personService.create({ name: newName, number: newNumber }).then(response => {
          console.log("created", newName, newNumber)
          showNotification(`Added ${newName}`, true)
          setPersons(persons.concat(response.data))
          setNewName('')
          setNewNumber('')
        }).catch(error => {
          console.log("error when creating", error)
          showNotification(error.response.data.error, false)
        })
      }}>add</button>
    </div>
  )
}

const PersonRow = ({ person, deletePerson, showNotification }) => {
  return (
    <li>
      {person.name} {person.number} <button onClick={() => {
        if (window.confirm(`Delete ${person.name}?`)) {
          deletePerson(person.id)
          showNotification(`Deleted ${person.name}`, true)
        }
      }}>delete</button>
    </li>
  )
}

const ShowPersons = ({ persons, filterName, deletePerson, showNotification }) => {
  return (
    <ul>
      {persons.filter(person => 
        person.name.toLowerCase().startsWith(filterName.toLowerCase()))
        .map(person =>
            <PersonRow key={person.name} person={person} deletePerson={deletePerson} showNotification={showNotification}/>
           )}
    </ul>
  )
}

const Notification = ({ message }) => {
  if (message === null) {
    return null
  }

  const isPositive = message.isPositive

  const notificationStyle = {
    color: isPositive ? "green" : "red",
    background: "lightgrey",
    fontSize: 20,
    borderStyle: "solid",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10
  }

  return (
    <div style={notificationStyle}>
      {message.text}
    </div>
  )
}

const App = () => {
  const [persons, setPersons] = useState([])

  const [newName, setNewName] = useState('')
  const [newNumber, setNewNumber] = useState('')
  const [filterName, setFilterName] = useState('')
  const [errorMessage, setErrorMessage] = useState(null)

  const getPersonsFromOnline = () => {
    personService.getAll().then(response => {
      setPersons(response.data)
    })
  }

  const deletePerson = (id) => {
    personService.remove(id).then(() => {
      setPersons(persons.filter(person => person.id !== id))
    }).catch(error => {
      console.log("error", error)
      showNotification(`Information of ${persons.find(person => person.id === id).name} has already been removed from server`, false)
      setPersons(persons.filter(person => person.id !== id))
    })
  }

  const showNotification = (text, isPositive) => {
    setErrorMessage({ text, isPositive })
    setTimeout(() => {
      setErrorMessage(null)
    }, 5000)
  }

  useEffect(getPersonsFromOnline, [])

  return (
    <div>
      <h2>Phonebook</h2>
      <Notification message={errorMessage}/>
      <form>
        <div>
          <FilterForm filterName={filterName} setFilterName={setFilterName}/>
        </div>
        <h2>add a new</h2>
        <div>
          name: <input onChange={(e) => {
            setNewName(e.target.value)
          }} value={newName}/>
        </div>
        <div>
          number: <input onChange={(e) => {
            setNewNumber(e.target.value)
          }} value={newNumber}/>
        </div>
        <div>
          <AddButton persons={persons} newName={newName} newNumber={newNumber} setPersons={setPersons} setNewName={setNewName} setNewNumber={setNewNumber} showNotification={showNotification}/>
        </div>
      </form>
      <div>debug: |{newName}|</div>
      <h2>Numbers</h2>
      <ShowPersons persons={persons} filterName={filterName} deletePerson={deletePerson} showNotification={showNotification}/>
    </div>
  )

}

export default App