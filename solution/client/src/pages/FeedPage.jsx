import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  apiClient,
  getRequestErrorMessage,
  isEndpointReady,
  requireEndpoint,
} from "../api/apiClient.js";
import { API_ENDPOINTS } from "../config/apiEndpoints.js";
import { useAuth } from "../context/AuthContext.jsx";

function formatDate(value) {
  if (!value) {
    return "Draft";
  }

  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
  }).format(new Date(value));
}

function PostCard({ post, canOpenDetail }) {
  return (
    <article className="story-card">
      <div className="story-meta">
        <span className={`status-pill status-${post.status}`}>{post.status}</span>
        <span>{formatDate(post.published_at || post.created_at)}</span>
      </div>
      <h2>{post.title}</h2>
      <p className="story-excerpt">{post.content}</p>
      <div className="story-footer">
        <div className="author">
          <span className="avatar" aria-hidden="true">
            {post.author_name?.slice(0, 1) || "A"}
          </span>
          <span>
            <small>Written by</small>
            <strong>{post.author_name}</strong>
          </span>
        </div>
        {canOpenDetail ? (
          <Link className="story-link" to={`/posts/${post.post_id}`}>
            Read story <span aria-hidden="true">↗</span>
          </Link>
        ) : (
          <span className="bonus-label">Detail is a bonus endpoint</span>
        )}
      </div>
    </article>
  );
}

export default function FeedPage() {
  const { isAuthenticated } = useAuth();
  const [posts, setPosts] = useState([]);
  const [formFilters, setFormFilters] = useState({
    search: "",
    status: "",
  });
  const [filters, setFilters] = useState({
    search: "",
    status: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadPosts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const endpoint = requireEndpoint(
        "listPosts",
        API_ENDPOINTS.listPosts,
      );
      const response = await apiClient.get(endpoint, {
        params: {
          status: filters.status || undefined,
          search: filters.search || undefined,
        },
      });
      setPosts(response.data.data);
    } catch (requestError) {
      setPosts([]);
      setError(getRequestErrorMessage(requestError));
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  const publishedCount = useMemo(
    () => posts.filter((post) => post.status === "published").length,
    [posts],
  );

  function handleSubmit(event) {
    event.preventDefault();
    setFilters({
      search: formFilters.search.trim(),
      status: formFilters.status,
    });
  }

  function clearFilters() {
    const emptyFilters = {
      search: "",
      status: "",
    };
    setFormFilters(emptyFilters);
    setFilters(emptyFilters);
  }

  const detailEndpointReady = isEndpointReady(API_ENDPOINTS.getPost(1));

  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">A quiet place for useful ideas</p>
          <h1>
            Stories built with
            <em> data and identity.</em>
          </h1>
          <p className="hero-description">
            An editorial React experience powered by Express, PostgreSQL
            relationships and JWT-protected writing.
          </p>
          <div className="hero-actions">
            {isAuthenticated ? (
              <Link className="button" to="/posts/new">
                Write a story
              </Link>
            ) : (
              <Link className="button" to="/register">
                Start writing
              </Link>
            )}
            <a className="text-link" href="#latest-stories">
              Browse the feed ↓
            </a>
          </div>
        </div>
        <aside className="hero-note">
          <span className="note-number">01</span>
          <p>Public reading.</p>
          <p>Authenticated writing.</p>
          <p>Relational ownership.</p>
          <div className="note-stat">
            <strong>{publishedCount}</strong>
            <span>published in this view</span>
          </div>
        </aside>
      </section>

      <section className="feed-section" id="latest-stories">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Latest stories</p>
            <h2>Ideas from the studio</h2>
          </div>
          <p>{posts.length} stories in this view</p>
        </div>

        <form className="filter-bar" onSubmit={handleSubmit}>
          <label className="search-field">
            <span>Search</span>
            <input
              type="search"
              value={formFilters.search}
              placeholder="PostgreSQL, JWT, API..."
              onChange={(event) =>
                setFormFilters((current) => ({
                  ...current,
                  search: event.target.value,
                }))
              }
            />
          </label>
          <label>
            <span>Status</span>
            <select
              value={formFilters.status}
              onChange={(event) =>
                setFormFilters((current) => ({
                  ...current,
                  status: event.target.value,
                }))
              }
            >
              <option value="">All stories</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <button className="button button-small" type="submit">
            Apply filters
          </button>
          <button
            className="button button-ghost button-small"
            type="button"
            onClick={clearFilters}
          >
            Reset
          </button>
        </form>

        {loading ? (
          <div className="state-card">
            <span className="loading-dot" />
            <h3>Opening the studio...</h3>
            <p>Requesting stories from the API.</p>
          </div>
        ) : null}

        {!loading && error ? (
          <div className="state-card state-card-error">
            <p className="eyebrow">Connection checkpoint</p>
            <h3>{error}</h3>
            <p>
              The interface is ready. Complete the matching backend route and
              connect its path in the endpoint file.
            </p>
            <button className="button button-small" type="button" onClick={loadPosts}>
              Try again
            </button>
          </div>
        ) : null}

        {!loading && !error && posts.length === 0 ? (
          <div className="state-card">
            <p className="eyebrow">No matches</p>
            <h3>No stories found for these filters.</h3>
            <button className="button button-small" type="button" onClick={clearFilters}>
              Clear filters
            </button>
          </div>
        ) : null}

        {!loading && !error && posts.length > 0 ? (
          <div className="story-grid">
            {posts.map((post) => (
              <PostCard
                key={post.post_id}
                post={post}
                canOpenDetail={detailEndpointReady}
              />
            ))}
          </div>
        ) : null}
      </section>
    </>
  );
}
