'use client';

import { useEffect, useState } from 'react';

import { ITodo } from './lib/ITodo';
import styles from './page.module.css';

export default function Home() {
  const [todos, setTodos] = useState<ITodo[]>([]);

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
      <main className={styles.main}>
        <h1 className={styles.title}>Add Todo</h1>
        <form onSubmit={addTodo}>
          <label htmlFor="title">Title:</label>
          <input id="title" type="text" autoComplete="title" required />
          <label htmlFor="description">Description:</label>
          <input
            id="description"
            type="text"
            autoComplete="description"
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
                  <p onClick={completeTodo(todo.id)}>Click to complete</p>
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
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </main>
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
      } else {
        console.error('Error:', response.status);
      }
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
