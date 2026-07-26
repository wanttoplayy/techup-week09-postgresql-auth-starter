import { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { getRequestErrorMessage } from "../api/apiClient.js";
import { useAuth } from "../context/AuthContext.jsx";

const emptyForm = {
  username: "",
  password: "",
  firstName: "",
  lastName: "",
};

export default function AuthPage({ mode }) {
  const isRegister = mode === "register";
  const { isAuthenticated, login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [formData, setFormData] = useState(emptyForm);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((current) => ({
      ...current,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (formData.username.trim().length < 3) {
      setError("Username must contain at least 3 characters.");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must contain at least 8 characters.");
      return;
    }

    if (isRegister && (!formData.firstName.trim() || !formData.lastName.trim())) {
      setError("First name and last name are required.");
      return;
    }

    setLoading(true);

    try {
      if (isRegister) {
        await register(formData);
        navigate("/login", {
          replace: true,
          state: {
            registered: true,
          },
        });
      } else {
        await login({
          username: formData.username,
          password: formData.password,
        });
        navigate(location.state?.from || "/", {
          replace: true,
        });
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="auth-layout">
      <div className="auth-story">
        <p className="eyebrow">Blog Studio membership</p>
        <h1>{isRegister ? "Make room for your next idea." : "Welcome back to the studio."}</h1>
        <p>
          {isRegister
            ? "Create an account, then follow the token from login to your first protected post request."
            : "Sign in to write. Reading the public feed never requires an account."}
        </p>
        <div className="auth-quote">
          <span>“</span>
          <p>The browser carries the token. The server still decides.</p>
        </div>
      </div>

      <div className="form-card">
        <p className="eyebrow">{isRegister ? "Create account" : "Sign in"}</p>
        <h2>{isRegister ? "Join Blog Studio" : "Continue writing"}</h2>

        {location.state?.registered && !isRegister ? (
          <div className="form-success" role="status">
            Account created. Sign in with your new credentials.
          </div>
        ) : null}

        {error ? (
          <div className="form-error" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          {isRegister ? (
            <div className="form-row">
              <label>
                <span>First name</span>
                <input
                  name="firstName"
                  value={formData.firstName}
                  autoComplete="given-name"
                  onChange={updateField}
                />
              </label>
              <label>
                <span>Last name</span>
                <input
                  name="lastName"
                  value={formData.lastName}
                  autoComplete="family-name"
                  onChange={updateField}
                />
              </label>
            </div>
          ) : null}

          <label>
            <span>Username</span>
            <input
              name="username"
              value={formData.username}
              autoComplete="username"
              placeholder="your-studio-name"
              onChange={updateField}
            />
          </label>

          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={formData.password}
              autoComplete={isRegister ? "new-password" : "current-password"}
              placeholder="At least 8 characters"
              onChange={updateField}
            />
          </label>

          <button className="button button-wide" type="submit" disabled={loading}>
            {loading
              ? "Connecting..."
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>
        </form>

        <p className="form-switch">
          {isRegister ? "Already a member?" : "New to the studio?"}{" "}
          <Link to={isRegister ? "/login" : "/register"}>
            {isRegister ? "Sign in" : "Create an account"}
          </Link>
        </p>
      </div>
    </section>
  );
}
