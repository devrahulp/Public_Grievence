import { useState } from "react";

function AdminLogin({ setAdminAuth }) {

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {

    e.preventDefault();

    const ADMIN_USER = "admin";
    const ADMIN_PASS = "1234";

    if (username === ADMIN_USER && password === ADMIN_PASS) {

      localStorage.setItem("adminAuth", "true");
      setAdminAuth(true);
      setError("");

    } else {

      setError("Invalid credentials");

    }

  };

  return (

    <div className="card">

      <h2>Admin Login</h2>

      <form onSubmit={handleLogin}>

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <br /><br />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br /><br />

        <button type="submit">
          Login
        </button>

      </form>

      {error && (
        <p style={{ color: "red" }}>
          {error}
        </p>
      )}

    </div>

  );

}

export default AdminLogin;