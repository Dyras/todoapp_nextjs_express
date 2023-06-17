'use client';

import { useEffect, useState } from 'react';

import { ITodo } from './lib/ITodo';
import styles from './page.module.css';

export default function Home() {
  const [todos, setTodos] = useState<ITodo[]>([]);
  const [editMode, setEditMode] = useState<boolean>(false);
  const [editingTodo, setEditingTodo] = useState<ITodo | null>(null);
  const [editTitle, setEditTitle] = useState<string>('');
  const [editDescription, setEditDescription] = useState<string>('');

  useEffect(() => {
    // Create random user ID if none is found
    if (localStorage.getItem('token') === null) {
      localStorage.setItem('token', Math.random().toString(36));
    }
    const token = localStorage.getItem('token');
    async function fetchTodos() {
      const response = await fetch(`http://localhost:3000/api/todos/${token}`);
      if (response.ok) {
        const data = await response.json();
        console.log(data.todos);
        setTodos(data.todos);
      } else {
        setTodos([]);
        console.error('Error:', response.status);
      }
    }
    fetchTodos();
  }, []);

  return (
    <div className={styles.container}>
      {!editMode ? (
        <main className={styles.main}>
          <h1 className={styles.title}>Add Todo</h1>
          <form onSubmit={addTodo}>
            <label htmlFor="title">Title:</label>
            <input
              id="title"
              type="text"
              autoComplete="title"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              required
            />
            <label htmlFor="description">Description:</label>
            <input
              id="description"
              type="text"
              autoComplete="description"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              required
            />
            <button type="submit">Submit</button>
          </form>

          <h1 className={styles.title}>Todos</h1>
          <div>
            {todos.map((todo) => (
              <div key={todo.id}>
                {todo.status === false ? (
                  <div>
                    <h1>{todo.title}</h1>
                    <p>{todo.description}</p>
                    <button onClick={() => editModeTodo(todo)}>Edit</button>
                    <br />
                    <button onClick={completeTodo(todo.id)}>Complete</button>
                    <br />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
          <h1 className={styles.title}>Completed Todos</h1>
          <div>
            {todos.map((todo) => (
              <div key={todo.id}>
                {todo.status === true ? (
                  <div>
                    <h2>{todo.title}</h2>
                    <p>{todo.description}</p>
                    <br />
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </main>
      ) : (
        <main className={styles.main}>
          <h1 className={styles.title}>Edit Todo</h1>
          <form onSubmit={addTodo}>
            <label htmlFor="editTitle">Title:</label>
            <input
              id="editTitle"
              type="text"
              autoComplete="editTitle"
              required
              value={editTitle} // Updated line
              onChange={(e) => setEditTitle(e.target.value)}
            />
            <label htmlFor="editDescription">Description:</label>
            <input
              id="editDescription"
              type="text"
              autoComplete="editDescription"
              required
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
            />
          </form>
          <button onClick={editTodo} type="submit">
            Submit
          </button>
          <button onClick={abortEdit}>Abort edit</button>
        </main>
      )}
    </div>
  );

  async function addTodo(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const title = (document.getElementById('title') as HTMLInputElement).value;

    const description = (
      document.getElementById('description') as HTMLInputElement
    ).value;
    if (title !== undefined && description !== undefined) {
      const response = await fetch(`http://localhost:3000/api/todos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: Math.random().toString(36),
          userId: localStorage.getItem('token'),
          title,
          description,
        }),
      });
      if (response.ok) {
        console.log('Todo added');
        const data = await response.json();
        setTodos([...todos, data.todo]);
        // Clear the document fields
        abortEdit();
      } else {
        console.error('Error:', response.status);
      }
    }
  }

  function editModeTodo(whichTodo: ITodo) {
    setEditMode(true);
    setEditingTodo(whichTodo);
    setEditTitle(whichTodo.title || '');
    setEditDescription(whichTodo.description || '');
  }

  function abortEdit() {
    setEditMode(false);
    setEditingTodo(null);
    setEditTitle('');
    setEditDescription('');
  }

  async function editTodo() {
    // Edit the todo
    if (editingTodo === null) return console.error('No todo to edit');
    const response = await fetch(`http://localhost:3000/api/todos`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: editingTodo.id,
        userId: localStorage.getItem('token'),
        title: (document.getElementById('editTitle') as HTMLInputElement).value,
        description: (
          document.getElementById('editDescription') as HTMLInputElement
        ).value,
      }),
    });
    if (response.ok) {
      console.log('Todo edited');
      // Edit the todo in the state
      const newTodosList = todos.map((todo) => {
        if (todo.id === editingTodo.id) {
          todo.title = (
            document.getElementById('editTitle') as HTMLInputElement
          ).value;
          todo.description = (
            document.getElementById('editDescription') as HTMLInputElement
          ).value;
        }
        return todo;
      });
      setTodos(newTodosList);
      abortEdit();
    }
  }

  function completeTodo(todoToComplete: string) {
    return async function () {
      const response = await fetch(`http://localhost:3000/api/todos/complete`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: todoToComplete,
          userId: localStorage.getItem('token'),
        }),
      });
      if (response.ok) {
        console.log('Todo completed');
        // Set the todo to completed in the Array
        const newTodosList = todos.map((todo) => {
          if (todo.id === todoToComplete) {
            todo.status = true;
          }
          return todo;
        });
        setTodos(newTodosList);
      } else {
        console.error('Error:', response.status);
      }
    };
  }
}
