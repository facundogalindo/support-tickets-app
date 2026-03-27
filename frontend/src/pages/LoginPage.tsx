import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (user) {
      if (user.role === "agent") {
        navigate("/admin/tickets");
      } else {
        navigate("/my-tickets");
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Email y contraseña son obligatorios");
      return;
    }

    try {
      await login({ email, password });
    } catch (err: any) {
      console.error("Error completo en login:", err);
      console.error("Respuesta del backend:", err?.response?.data);

      setError(err?.response?.data?.message || "Error al iniciar sesión");
    }
  };

  return (
    <div className="container">
      <h1>Iniciar sesión</h1>

      <form onSubmit={handleSubmit}>
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

        {error && <p>{error}</p>}

        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}

export default LoginPage;