import { ITodo } from './Itodo';
import cors from 'cors';
import express from 'express';

// Things to do:
// 1. Add a PUT for completing a todo

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(express.json());
app.use(cors());

const todosStorage: ITodo[] = [];

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

// This POST request is for creating a new todo
app.post('/api/todos', (req, res) => {
  const { id, title, userId, description } = req.body;
  const status = false;

  // Check if id and userId was included in the POST request, if not, return an error
  if (!id) {
    return res.status(400).json({ error: 'Invalid todo data, id is missing' });
  } else if (!userId) {
    return res
      .status(400)
      .json({ error: 'Invalid todo data, userId is missing' });
  }

  const newTodo: ITodo = { id, title, userId, description, status };

  // Adds the new todo to the todo array
  todosStorage.push(newTodo);

  console.log('New todo created:', newTodo);
  return res
    .status(201)
    .json({ message: 'Todo created successfully', todo: newTodo });
});

// This GET request is for getting all todos by a specific user
app.get('/api/todos/:id', (req, res) => {
  const userId = req.params.id;
  const userTodos = todosStorage.filter((todo) => todo.userId === userId);

  // Check if the user has created any todos, if there are none, return an error
  if (userTodos.length === 0) {
    return res.status(404).json({ error: 'No todos yet!' });
  }

  return res.status(200).json({ todos: userTodos });
});

// This PUT request is for updating a todo
app.put('/api/todos', (req, res) => {
  const { id, title, userId, description, status } = req.body;
  const todoToUpdate = todosStorage.find((todo) => todo.id === id);

  // Check if the todo exists, if it doesn't, return an error
  if (!todoToUpdate) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // Update the fields of the todo
  if (userId == todoToUpdate.userId) {
    todoToUpdate.title = title || todoToUpdate.title;
    todoToUpdate.description = description || todoToUpdate.description;
    todoToUpdate.status = status || todoToUpdate.status;

    console.log('Todo updated:', todoToUpdate);
    return res.status(200).json({ message: 'Todo updated successfully' });
  }
});

// Set the status of a todo to complete
app.put('/api/todos/complete', (req, res) => {
  const { id, userId } = req.body;
  const todoToUpdate = todosStorage.find((todo) => todo.id === id);

  // If the todo is not found, return a 404 error
  if (!todoToUpdate) {
    return res.status(404).json({ error: 'Todo not found' });
  }

  // If the user id matches the todo's user id, set the status to true
  if (userId == todoToUpdate.userId) {
    todoToUpdate.status = true;

    console.log('Todo completed:', todoToUpdate);
    return res.status(200).json({ message: 'Todo completed successfully' });
  }
});
