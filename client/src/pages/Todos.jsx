import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../styles/ToDoItem.css";


export default function Todos() {
  const [todos, setTodos] = useState([]);
  const [newTodo, setNewTodo] = useState("");
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState("");

  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadTodos() {
      const res = await fetch(`http://localhost:3000/api/lists/${id}/todos`, {
        credentials: "include",
      });

      if (res.status === 401) {
        navigate("/login");
        return;
      }

      const data = await res.json();
      setTodos(data);
    }

    loadTodos();
  }, [id, navigate]);

  async function addTodo(e) {
    e.preventDefault();

    const res = await fetch(`http://localhost:3000/api/lists/${id}/todos`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTodo }),
    });

    if (res.ok) {
      const created = await res.json();
      setTodos([...todos, created]);
      setNewTodo("");
    }
  }

  async function toggleCompleted(todo) {
    const res = await fetch(`http://localhost:3000/api/todos/${todo.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: !todo.completed }),
    });

    if (res.ok) {
      setTodos((prev) =>
        prev.map((t) =>
          t.id === todo.id ? { ...t, completed: !t.completed } : t
        )
      );
    }
  }

  async function handleEditKey(e, todo) {
  if (e.key === "Escape") {
    setEditId(null);
    setEditText("");
    return;
  }
  if (e.key === "Enter") {
    const res = await fetch(`http://localhost:3000/api/todos/${todo.id}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editText }),
    });
    if (res.ok) {
      setTodos(prev =>
        prev.map(t =>
          t.id === todo.id ? { ...t, title: editText } : t
        )
      );
    }

    setEditId(null);
    setEditText("");
  }
}

  async function deleteTodo(id) {
  const res = await fetch(`http://localhost:3000/api/todos/${id}`, {
    method: "DELETE",
    credentials: "include"
  });

  if (res.ok) {
    setTodos(todos.filter(t => t.id !== id));
  }
}


  return (
    <div>
      <h1>Todos for list {id}</h1>

      {todos.length === 0 && <p>No todos yet.</p>}

      {todos.map((todo) => (
        <div key={todo.id} className="todo-item">
          <input
            type="checkbox"
            checked={todo.completed}
            onChange={() => toggleCompleted(todo)}
          />
          
          {editId === todo.id ? (
            <input
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => handleEditKey(e, todo)}/>
            ) : (
            <span> {todo.title} </span>
          )}
          <button
            onClick={() => {
            setEditId(todo.id);
            setEditText(todo.title);
            }}
            className="edit-button">✏️</button>
          <button onClick={() => deleteTodo(todo.id)} className="clasic-button">Delete</button>
        </div>
      ))}

      <form onSubmit={addTodo}>
        <input
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          placeholder="Add a todo..."
        />
        <button type="submit">Add</button>
      </form>
    </div>
  );
}
