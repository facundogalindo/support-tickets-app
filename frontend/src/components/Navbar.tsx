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

  return (
    <div className="navbar">
      <div>
        <strong>{user.name}</strong> - {user.role}
      </div>

      <button onClick={handleLogout}>Cerrar sesión</button>
    </div>
  );
}

export default Navbar;