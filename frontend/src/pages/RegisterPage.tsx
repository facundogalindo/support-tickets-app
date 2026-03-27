import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { registerRequest } from "../services/authService";

function RegisterPage() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"user" | "agent">("user");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!name.trim() || !email.trim() || !password.trim() || !role) {
      setError("Todos los campos son obligatorios");
      return;
    }

    try {
      await registerRequest({
        name,
        email,
        password,
        role,
      });

      setSuccessMessage("Usuario registrado correctamente");

      setName("");
      setEmail("");
      setPassword("");
      setRole("user");

      setTimeout(() => {
        navigate("/login");
      }, 1200);
    } catch (err: any) {
      console.error("Error en register:", err);
      console.error("Respuesta del backend:", err?.response?.data);

      setError(err?.response?.data?.message || "Error al registrar usuario");
    }
  };

  return (
    <div className="container">
      <h1>Registrarse</h1>

      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="name">Nombre</label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ingresá tu nombre"
          />
        </div>

        <div>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ingresá tu email"
          />
        </div>

        <div>
          <label htmlFor="password">Contraseña</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Ingresá tu contraseña"
          />
        </div>

        <div>
          <label htmlFor="role">Rol</label>
          <select
            id="role"
            value={role}
            onChange={(e) => setRole(e.target.value as "user" | "agent")}
          >
            <option value="user">User</option>
            <option value="agent">Agent</option>
          </select>
        </div>

        {error && <p>{error}</p>}
        {successMessage && <p>{successMessage}</p>}

        <button type="submit">Registrarme</button>
      </form>
    </div>
  );
}

export default RegisterPage;