import { Todo } from './Itodo';
import express from 'express';
import fs from 'fs';

// Things to do:
// 1. Move to using in-memory storage
// 2. Add a PUT for completing a todo

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(express.json());

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

app.post('/api/todos', (req, res) => {
  const { id, title, userId, description } = req.body;
  const status = false;
  if (!id) {
    return res.status(400).json({ error: 'Invalid todo data, id is missing' });
  } else if (!userId) {
    return res
      .status(400)
      .json({ error: 'Invalid todo data, userId is missing' });
  }

  const newTodo: Todo = { id, title, userId, description, status };
  const fileName = `${userId}.json`;

  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        const todos = { todos: [newTodo] };
        fs.writeFile(fileName, JSON.stringify(todos, null, 2), (err) => {
          if (err) {
            console.error(err);
            return res
              .status(500)
              .json({ error: 'Failed to save todo, write error' });
          }
          console.log('New todo created:', newTodo);
          return res
            .status(201)
            .json({ message: 'Todo created successfully', todo: newTodo });
        });
        return;
      }
      console.error(err);
      return res.status(500).json({ error: 'Failed to save todo' });
    }

    try {
      const todos = JSON.parse(data);
      todos.todos.push(newTodo);
      fs.writeFile(fileName, JSON.stringify(todos, null, 2), (err) => {
        if (err) {
          console.error(err);
          return res
            .status(500)
            .json({ error: 'Failed to save todo, write error' });
        }
        console.log('New todo created:', newTodo);
        return res.status(201).json({
          message: 'Todo written to disk successfully',
          todo: newTodo,
        });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to save todo' });
    }
  });
});

app.get('/api/todos', (req, res) => {
  return res.status(200).json({ message: 'Hello World' });
});

app.get('/api/todos/:id', (req, res) => {
  console.log(req.params.id);
  console.log(req.params);
  const userId = req.params.id;
  const fileName = `${userId}.json`;
  fs.readFile(fileName, 'utf8', (err, data) => {
    console.log(fileName);
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'Todo not found' });
      }
      console.error(err);
      return res.status(500).json({ error: 'Failed to read todo' });
    }

    try {
      const todos = JSON.parse(data);
      return res.status(200).json({ todos: todos.todos });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to read todo' });
    }
  });
});

// Edit a todo
app.put('/api/todos', (req, res) => {
  console.log(req.body);
  const { id, title, userId, description } = req.body;
  const fileName = `${userId}.json`;

  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        return res.status(404).json({ error: 'Todo not found' });
      }
      console.error(err);
      return res.status(500).json({ error: 'Failed to read todo' });
    }

    try {
      const todos = JSON.parse(data);
      const todoToUpdate = todos.todos.find((todo) => todo.id === id);

      if (!todoToUpdate) {
        return res.status(404).json({ error: 'Todo not found' });
      }

      // Update the fields of the todo
      todoToUpdate.title = title || todoToUpdate.title;
      todoToUpdate.description = description || todoToUpdate.description;

      fs.writeFile(fileName, JSON.stringify(todos, null, 2), (err) => {
        if (err) {
          console.error(err);
          return res.status(500).json({ error: 'Failed to update todo' });
        }
        console.log('Todo updated:', todoToUpdate);
        return res.status(200).json({ message: 'Todo updated successfully' });
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ error: 'Failed to update todo' });
    }
  });
});
