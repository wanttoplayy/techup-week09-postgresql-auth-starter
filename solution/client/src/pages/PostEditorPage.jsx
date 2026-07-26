import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  apiClient,
  getRequestErrorMessage,
  requireEndpoint,
} from "../api/apiClient.js";
import { API_ENDPOINTS } from "../config/apiEndpoints.js";

const emptyPost = {
  title: "",
  content: "",
  status: "draft",
};

export default function PostEditorPage({ mode }) {
  const isEdit = mode === "edit";
  const { postId } = useParams();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyPost);
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEdit) {
      return;
    }

    async function loadPost() {
      setError("");

      try {
        const endpoint = requireEndpoint(
          "getPost",
          API_ENDPOINTS.getPost(postId),
        );
        const response = await apiClient.get(endpoint);
        setFormData({
          title: response.data.data.title,
          content: response.data.data.content,
          status: response.data.data.status,
        });
      } catch (requestError) {
        setError(getRequestErrorMessage(requestError));
      } finally {
        setLoading(false);
      }
    }

    loadPost();
  }, [isEdit, postId]);

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

    if (formData.title.trim().length < 3) {
      setError("Title must contain at least 3 characters.");
      return;
    }

    if (formData.content.trim().length < 20) {
      setError("Content must contain at least 20 characters.");
      return;
    }

    setSaving(true);

    try {
      if (isEdit) {
        const endpoint = requireEndpoint(
          "updatePost",
          API_ENDPOINTS.updatePost(postId),
        );
        await apiClient.put(endpoint, formData);
        navigate(`/posts/${postId}`);
      } else {
        const endpoint = requireEndpoint(
          "createPost",
          API_ENDPOINTS.createPost,
        );
        await apiClient.post(endpoint, formData);
        navigate("/");
      }
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <section className="editor-layout">
        <div className="state-card">
          <span className="loading-dot" />
          <h3>Loading the draft...</h3>
        </div>
      </section>
    );
  }

  return (
    <section className="editor-layout">
      <aside className="editor-guide">
        <p className="eyebrow">{isEdit ? "Bonus route" : "Protected route"}</p>
        <h1>{isEdit ? "Refine the story." : "Write with your identity attached."}</h1>
        <p>
          The form sends title, content and status. The server gets the author
          from the verified JWT — never from this form.
        </p>
        <div className="guide-list">
          <span>01</span>
          <p>Validate the body</p>
          <span>02</span>
          <p>Verify the Bearer token</p>
          <span>03</span>
          <p>Insert with `req.user.userId`</p>
        </div>
      </aside>

      <div className="editor-card">
        <div className="editor-heading">
          <div>
            <p className="eyebrow">{isEdit ? "Edit story" : "New story"}</p>
            <h2>{isEdit ? "Update your post" : "Create a post"}</h2>
          </div>
          <Link className="text-link" to="/">
            Cancel
          </Link>
        </div>

        {error ? (
          <div className="form-error" role="alert">
            {error}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <label>
            <span>Title</span>
            <input
              name="title"
              value={formData.title}
              maxLength={120}
              placeholder="A specific, useful title"
              onChange={updateField}
            />
          </label>

          <label>
            <span>Story</span>
            <textarea
              name="content"
              value={formData.content}
              rows={12}
              placeholder="Write at least 20 characters..."
              onChange={updateField}
            />
          </label>

          <div className="editor-footer">
            <label>
              <span>Status</span>
              <select name="status" value={formData.status} onChange={updateField}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </label>
            <button className="button" type="submit" disabled={saving}>
              {saving
                ? "Saving..."
                : isEdit
                  ? "Save changes"
                  : "Publish to studio"}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
