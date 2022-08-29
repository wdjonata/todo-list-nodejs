const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers

  const user = users.find((user) => user.username === username)

  if (!user) {
    return response.status(400).json({error: 'User not found'})
  }

  request.user = user

  return next()

}

app.post('/users', (request, response) => {
  const { name, username } = request.body

  const id = uuidv4()

  users.push({
    id,
    name,
    username,
    todos: []
  })

  return response.status(201).send()

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request

  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body

  const id = uuidv4()

  const newTask = {
    id,
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  }

  user.todos.push(newTask)

  return response.status(201).send()

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const { id } = request.params

  const todos = user.todos.map((todo) => {
    if (todo.id === id) {
      todo.title = title
      todo.deadline = deadline
    }

    return todo
  })

  user.todos = todos

  return response.status(201).send()
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const todos = user.todos.map((todo) => {
    if (todo.id === id) {
      todo.done = true
    }

    return todo
  })

  user.todos = todos

  return response.status(201).send()
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params

  const newTodoList = user.todos.filter((item) => item.id !== id)

  user.todos = newTodoList

  return response.status(201).send()

});

module.exports = app;