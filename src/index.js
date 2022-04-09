const express = require('express');
const cors = require('cors');
const { send } = require('express/lib/response');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(user => user.username === username);

  if(!user) {
    return response.status(400).json({ error: "Username not found" })
  }
  request.user = user;

  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some((user) => user.username === username);

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: "Username already exists! Try another one!"})
  }

  const user = ({ 
    id: uuidv4(), // precisa ser um uuid
    name,
    username, 
    todos: []
  });

  users.push(user);

  return response.status(201).send(user)

});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.status(201).json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;  

  const newTodo = { 
    id: uuidv4(), // precisa ser um uuid
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date()
  };

  user.todos.push(newTodo);

  return response.status(201).send(newTodo);

});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;
  const { title, deadline } = request.body;

  const todos = user.todos;

  const todo = todos.find(todo => todo.id === id);

  if (!todo){
    return response.status(404).json({error: "Todo not found!"})
  }
  todo.title = title;
  todo.deadline = new Date(deadline);
  

  return response.status(200).send(todo);

});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todos = user.todos;

  const todo = todos.find(todo => todo.id === id);

  if (!todo){
    return response.status(404).json({error: "Todo not found!"})
  }
  todo.done = true;
  

  return response.status(200).send(todo);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { id } = request.params;

  const todos = user.todos;

  const todo = todos.find(todo => todo.id === id);

  if (!todo){
    return response.status(404).json({error: "Todo not found!"})
  }

  todos.splice(todo, 1);
  return response.status(204).send(todos);
});

module.exports = app;