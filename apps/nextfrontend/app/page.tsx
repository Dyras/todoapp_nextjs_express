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
        console.error('Error:', response.status);
      }
    }
    fetchTodos();
  }, []);

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <h1 className={styles.title}>Todos</h1>
        <div>
          {todos.map((todo) => (
            <div key={todo.id}>
              {todo.status === false ? (
                <div>
                  <h2>{todo.title}</h2>
                  <p>{todo.description}</p>
                  <p>Click to complete</p>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
