import { Router } from "express";
import connectionPool from "../utils/db.js";
import { protect } from "../middlewares/protect.js";

const postRouter = Router();
const allowedStatuses = ["draft", "published"];

function cleanText(value) {
  return typeof value === "string" ? value.trim() : "";
}

function parsePostId(value) {
  const postId = Number(value);

  if (!Number.isInteger(postId) || postId <= 0) {
    return null;
  }

  return postId;
}

function validatePostBody(body) {
  const title = cleanText(body.title);
  const content = cleanText(body.content);
  const status = cleanText(body.status);

  if (title.length < 3 || title.length > 120) {
    return {
      error: "title must contain 3 to 120 characters",
    };
  }

  if (content.length < 20) {
    return {
      error: "content must contain at least 20 characters",
    };
  }

  if (!allowedStatuses.includes(status)) {
    return {
      error: "status must be draft or published",
    };
  }

  return {
    data: {
      title,
      content,
      status,
    },
  };
}

postRouter.get("/", async (req, res) => {
  const status = cleanText(req.query.status);
  const search = cleanText(req.query.search);

  if (status && !allowedStatuses.includes(status)) {
    return res.status(400).json({
      message: "status must be draft or published",
    });
  }

  if (search.length > 100) {
    return res.status(400).json({
      message: "search must not exceed 100 characters",
    });
  }

  try {
    const result = await connectionPool.query(`
      SELECT
        p.post_id,
        p.title,
        p.content,
        p.status,
        p.author_id,
        p.created_at,
        p.updated_at,
        p.published_at,
        CONCAT(u.first_name, ' ', u.last_name) AS author_name
      FROM posts p
      JOIN users u ON p.author_id = u.user_id
      ORDER BY p.created_at DESC
    `);

    let posts = result.rows;

    if (status) {
      posts = posts.filter((post) => post.status === status);
    }

    if (search) {
      const keyword = search.toLowerCase();

      posts = posts.filter((post) => {
        const title = post.title.toLowerCase();
        const content = post.content.toLowerCase();

        return title.includes(keyword) || content.includes(keyword);
      });
    }

    return res.status(200).json({
      data: posts,
    });
  } catch (error) {
    console.error("[GET /posts] error:", error.message);

    return res.status(500).json({
      message: "Server could not get posts",
    });
  }
});

postRouter.post("/", protect, async (req, res) => {
  const input = validatePostBody(req.body);

  if (input.error) {
    return res.status(400).json({
      message: input.error,
    });
  }

  const publishedAt =
    input.data.status === "published" ? new Date() : null;

  try {
    const result = await connectionPool.query(
      `
        INSERT INTO posts (
          title,
          content,
          status,
          author_id,
          published_at
        )
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `,
      [
        input.data.title,
        input.data.content,
        input.data.status,
        req.user.userId,
        publishedAt,
      ],
    );

    return res.status(201).json({
      message: "Post has been created",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("[POST /posts] error:", error.message);
    return res.status(500).json({
      message: "Server could not create post",
    });
  }
});

postRouter.get("/:postId", async (req, res) => {
  const postId = parsePostId(req.params.postId);

  if (!postId) {
    return res.status(400).json({
      message: "postId must be a positive integer",
    });
  }

  try {
    const result = await connectionPool.query(
      `
        SELECT
          p.post_id,
          p.title,
          p.content,
          p.status,
          p.author_id,
          p.created_at,
          p.updated_at,
          p.published_at,
          CONCAT(u.first_name, ' ', u.last_name) AS author_name
        FROM posts p
        JOIN users u ON p.author_id = u.user_id
        WHERE p.post_id = $1
      `,
      [postId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      data: result.rows[0],
    });
  } catch (error) {
    console.error("[GET /posts/:postId] error:", error.message);
    return res.status(500).json({
      message: "Server could not get post",
    });
  }
});

postRouter.put("/:postId", protect, async (req, res) => {
  const postId = parsePostId(req.params.postId);

  if (!postId) {
    return res.status(400).json({
      message: "postId must be a positive integer",
    });
  }

  const input = validatePostBody(req.body);

  if (input.error) {
    return res.status(400).json({
      message: input.error,
    });
  }

  const publishedAt =
    input.data.status === "published" ? new Date() : null;

  try {
    const result = await connectionPool.query(
      `
        UPDATE posts
        SET
          title = $1,
          content = $2,
          status = $3,
          updated_at = CURRENT_TIMESTAMP,
          published_at = $4
        WHERE post_id = $5
          AND author_id = $6
        RETURNING *
      `,
      [
        input.data.title,
        input.data.content,
        input.data.status,
        publishedAt,
        postId,
        req.user.userId,
      ],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      message: "Post has been updated",
      data: result.rows[0],
    });
  } catch (error) {
    console.error("[PUT /posts/:postId] error:", error.message);
    return res.status(500).json({
      message: "Server could not update post",
    });
  }
});

postRouter.delete("/:postId", protect, async (req, res) => {
  const postId = parsePostId(req.params.postId);

  if (!postId) {
    return res.status(400).json({
      message: "postId must be a positive integer",
    });
  }

  try {
    const result = await connectionPool.query(
      `
        DELETE FROM posts
        WHERE post_id = $1
          AND author_id = $2
        RETURNING post_id
      `,
      [postId, req.user.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    return res.status(200).json({
      message: "Post has been deleted",
      data: {
        post_id: result.rows[0].post_id,
      },
    });
  } catch (error) {
    console.error("[DELETE /posts/:postId] error:", error.message);
    return res.status(500).json({
      message: "Server could not delete post",
    });
  }
});

export default postRouter;
