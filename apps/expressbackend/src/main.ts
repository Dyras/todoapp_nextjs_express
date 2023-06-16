import { Todo } from './Itodo';
import express from 'express';

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

  console.log('New todo created:', newTodo);

  return res
    .status(201)
    .json({ message: 'Todo created successfully', todo: newTodo });
});
