import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";


export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();

    const res = await fetch("http://localhost:3000/api/login", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    });

    if (res.ok) {
      navigate("/lists");
    } else {
      alert("Invalid credentials");
    }
  }

  return (
    <div className="login-page">
      <div className="login-header"><h1>Login</h1></div>
      <form onSubmit={handleLogin}>
        <input 
          placeholder="Username" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)}
        />
        <input 
          placeholder="Password" 
          type="password"
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
        />
        <button>Login</button>
      </form>
    </div>
  );
}
