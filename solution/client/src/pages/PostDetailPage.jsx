import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  apiClient,
  getRequestErrorMessage,
  isEndpointReady,
  requireEndpoint,
} from "../api/apiClient.js";
import { API_ENDPOINTS } from "../config/apiEndpoints.js";
import { useAuth } from "../context/AuthContext.jsx";

function formatDate(value) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "long",
  }).format(new Date(value));
}

export default function PostDetailPage() {
  const { postId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadPost() {
      setError("");

      try {
        const endpoint = requireEndpoint(
          "getPost",
          API_ENDPOINTS.getPost(postId),
        );
        const response = await apiClient.get(endpoint);
        setPost(response.data.data);
      } catch (requestError) {
        setError(getRequestErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [postId]);

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this story? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setDeleting(true);
    setError("");

    try {
      const endpoint = requireEndpoint(
        "deletePost",
        API_ENDPOINTS.deletePost(postId),
      );
      await apiClient.delete(endpoint);
      navigate("/");
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
      setDeleting(false);
    }
  }

  if (loading) {
    return (
      <section className="article-page">
        <div className="state-card">
          <span className="loading-dot" />
          <h3>Opening story...</h3>
        </div>
      </section>
    );
  }

  if (error || !post) {
    return (
      <section className="article-page">
        <div className="state-card state-card-error">
          <p className="eyebrow">Bonus connection</p>
          <h3>{error || "Story not found."}</h3>
          <Link className="button button-small" to="/">
            Back to stories
          </Link>
        </div>
      </section>
    );
  }

  const ownsPost = Number(user?.userId) === Number(post.author_id);
  const canEdit = ownsPost && isEndpointReady(API_ENDPOINTS.updatePost(postId));
  const canDelete =
    ownsPost && isEndpointReady(API_ENDPOINTS.deletePost(postId));

  return (
    <article className="article-page">
      <Link className="text-link" to="/">
        ← All stories
      </Link>
      <header className="article-header">
        <span className={`status-pill status-${post.status}`}>{post.status}</span>
        <h1>{post.title}</h1>
        <div className="article-byline">
          <span className="avatar">{post.author_name.slice(0, 1)}</span>
          <p>
            <strong>{post.author_name}</strong>
            <span>{formatDate(post.published_at || post.created_at)}</span>
          </p>
        </div>
      </header>
      <div className="article-content">{post.content}</div>

      {ownsPost ? (
        <footer className="article-actions">
          {canEdit ? (
            <Link className="button button-small" to={`/posts/${postId}/edit`}>
              Edit story
            </Link>
          ) : (
            <span className="bonus-label">Connect updatePost to edit</span>
          )}
          {canDelete ? (
            <button
              className="button button-danger button-small"
              type="button"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? "Deleting..." : "Delete"}
            </button>
          ) : (
            <span className="bonus-label">Connect deletePost to delete</span>
          )}
        </footer>
      ) : null}
    </article>
  );
}
