// client/src/App.jsx
import { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, NavLink, useNavigate } from "react-router-dom";
import { getToken, getUser, clearToken } from "./api";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Compose from "./pages/Compose.jsx";
import History from "./pages/History.jsx";

function Layout({ children }) {
  const navigate = useNavigate();
  const user = getUser();

  const logout = () => {
    clearToken();
    navigate("/login");
  };

  return (
    <>
      <header className="nav">
        <strong className="brand">Bulk Mail</strong>
        <nav>
          <NavLink to="/" end>Compose</NavLink>
          <NavLink to="/history">History</NavLink>
        </nav>
        <div className="nav-right">
          {user?.name && <span className="muted">{user.name}</span>}
          <button className="btn btn-ghost" onClick={logout}>Logout</button>
        </div>
      </header>
      <main className="container">{children}</main>
    </>
  );
}

function Protected({ children }) {
  if (!getToken()) return <Navigate to="/login" replace />;
  return <Layout>{children}</Layout>;
}

function Guest({ children }) {
  if (getToken()) return <Navigate to="/" replace />;
  return children;
}

function AuthWatcher({ children }) {
  const navigate = useNavigate();
  const [, force] = useState(0);
  useEffect(() => {
    const onExpired = () => {
      force((n) => n + 1);
      navigate("/login");
    };
    window.addEventListener("auth-expired", onExpired);
    return () => window.removeEventListener("auth-expired", onExpired);
  }, [navigate]);
  return children;
}

export default function App() {
  return (
    <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <AuthWatcher>
        <Routes>
          <Route path="/login" element={<Guest><Login /></Guest>} />
          <Route path="/register" element={<Guest><Register /></Guest>} />
          <Route path="/" element={<Protected><Compose /></Protected>} />
          <Route path="/history" element={<Protected><History /></Protected>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthWatcher>
    </BrowserRouter>
  );
}
