import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (!user) {
    return null;
  }

  const roleLabel = user.role === "agent" ? "Agente" : "Usuario";

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <h1 className="text-lg font-bold text-slate-800">
            Support Tickets System
          </h1>
          <p className="text-sm text-slate-500">
            {user.name} · {roleLabel}
          </p>
        </div>

        <button
          onClick={handleLogout}
          className="rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-800"
        >
          Cerrar sesión
        </button>
      </div>
    </header>
  );
}

export default Navbar;