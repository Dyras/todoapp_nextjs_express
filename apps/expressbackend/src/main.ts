import express from 'express';
import fs from 'fs';

const host = process.env.HOST ?? 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();

app.use(express.json());

interface Todo {
  id: string;
  title?: string;
  userId: string;
  description?: string;
  status: boolean;
}

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});

// Creates a Post API to receive new todos
app.post('/api/todos', (req, res) => {
  const { id, title, userId, description } = req.body;
  const status = false;

  // If the ID or user ID is missing, return an error
  if (!id) {
    return res.status(400).json({ error: 'Invalid todo data' });
  } else if (!userId) {
    return res.status(400).json({ error: 'Invalid user id' });
  }
  // Create a new todo from the received data
  const newTodo: Todo = { id, title, userId, description, status };

  // Create a file name from the user ID
  const fileName = `${userId}.json`;

  // Check if the file already exists
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') {
        // File doesn't exist, proceed to save the todo
        return saveTodo();
      }
      console.error(err);
      return res.status(500).json({ error: 'Failed to read todo file' });
    }

    return saveTodo();
  });

  // Saves the todo to the file
  function saveTodo() {
    const todoString = JSON.stringify(newTodo) + '\n';
    fs.appendFile(fileName, todoString, (err) => {
      if (err) {
        console.error(err);
        return res.status(500).json({ error: 'Failed to save todo' });
      }
      return res
        .status(201)
        .json({ message: 'Todo created successfully', todo: newTodo });
    });
  }
});
