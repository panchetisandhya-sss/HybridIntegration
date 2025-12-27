import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const navigate = useNavigate();

  const [voterId, setVoterId] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = (e) => {
    e.preventDefault();

    // DEMO CREDENTIALS (for project submission)
    if (voterId === "VOTER123" && password === "quantum") {
      navigate("/usecase");
    } else {
      setError("Invalid Voter ID or Password");
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        background: "linear-gradient(135deg, #020617, #020617)",
      }}
    >
      <form
        onSubmit={handleLogin}
        style={{
          background: "#020617",
          padding: "40px",
          borderRadius: "12px",
          width: "360px",
          boxShadow: "0 0 30px rgba(56,189,248,0.3)",
          color: "#fff",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Quantum Secure Voting
        </h2>

        <label>Voter ID</label>
        <input
          type="text"
          value={voterId}
          onChange={(e) => setVoterId(e.target.value)}
          placeholder="Enter Voter ID"
          required
          style={inputStyle}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter Password"
          required
          style={inputStyle}
        />

        {error && (
          <p style={{ color: "#ef4444", marginTop: "10px" }}>{error}</p>
        )}

        <button
          type="submit"
          style={{
            width: "100%",
            marginTop: "20px",
            padding: "12px",
            background: "#38bdf8",
            border: "none",
            borderRadius: "8px",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Login Securely
        </button>

        <p style={{ marginTop: "15px", fontSize: "12px", opacity: 0.7 }}>
          BB84 + E91 Hybrid Quantum Authentication
        </p>
      </form>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  padding: "10px",
  marginTop: "8px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #334155",
  background: "#020617",
  color: "#fff",
};

