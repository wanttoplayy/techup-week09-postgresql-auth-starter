import {
  Link,
  NavLink,
  Navigate,
  Outlet,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import FeedPage from "./pages/FeedPage.jsx";
import AuthPage from "./pages/AuthPage.jsx";
import PostEditorPage from "./pages/PostEditorPage.jsx";
import PostDetailPage from "./pages/PostDetailPage.jsx";

function AppShell() {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="site-shell">
      <header className="site-header">
        <Link className="brand" to="/" aria-label="Blog Studio home">
          <span className="brand-mark">B</span>
          <span>
            <strong>Blog Studio</strong>
            <small>PostgreSQL edition</small>
          </span>
        </Link>

        <nav className="primary-nav" aria-label="Main navigation">
          <NavLink to="/">Stories</NavLink>
          {isAuthenticated ? <NavLink to="/posts/new">Write</NavLink> : null}
        </nav>

        <div className="header-actions">
          {isAuthenticated ? (
            <>
              <span className="user-chip">
                {user.firstName} {user.lastName}
              </span>
              <button className="button button-ghost" type="button" onClick={logout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link className="text-link" to="/login">
                Sign in
              </Link>
              <Link className="button button-small" to="/register">
                Join studio
              </Link>
            </>
          )}
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="site-footer">
        <p>Blog Studio</p>
        <p>React → Express → PostgreSQL</p>
      </footer>
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}

function NotFoundPage() {
  return (
    <section className="centered-page">
      <p className="eyebrow">404</p>
      <h1>This page is still unwritten.</h1>
      <p>Return to the studio and choose another story.</p>
      <Link className="button" to="/">
        Back to stories
      </Link>
    </section>
  );
}

export default function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route index element={<FeedPage />} />
        <Route path="login" element={<AuthPage mode="login" />} />
        <Route path="register" element={<AuthPage mode="register" />} />
        <Route
          path="posts/new"
          element={
            <ProtectedRoute>
              <PostEditorPage mode="create" />
            </ProtectedRoute>
          }
        />
        <Route path="posts/:postId" element={<PostDetailPage />} />
        <Route
          path="posts/:postId/edit"
          element={
            <ProtectedRoute>
              <PostEditorPage mode="edit" />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
