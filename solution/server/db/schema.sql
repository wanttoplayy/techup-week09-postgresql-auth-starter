BEGIN;

DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  user_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(40) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  first_name VARCHAR(80) NOT NULL,
  last_name VARCHAR(80) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  post_id INTEGER GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  title VARCHAR(120) NOT NULL,
  content TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'published')),
  author_id INTEGER NOT NULL REFERENCES users(user_id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at TIMESTAMPTZ
);

INSERT INTO users (
  username,
  password_hash,
  first_name,
  last_name
)
VALUES (
  'seed-author',
  'seed-account-not-for-login',
  'Maya',
  'Chen'
);

INSERT INTO posts (
  title,
  content,
  status,
  author_id,
  created_at,
  updated_at,
  published_at
)
VALUES
  (
    'Why relational data feels different',
    'A post belongs to one author through author_id. PostgreSQL can join both rows when the public feed needs the author name.',
    'published',
    1,
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days',
    CURRENT_TIMESTAMP - INTERVAL '3 days'
  ),
  (
    'Parameterized queries are a team habit',
    'Placeholders keep request data separate from SQL syntax. The habit is small, but it makes every query easier to review safely.',
    'published',
    1,
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days',
    CURRENT_TIMESTAMP - INTERVAL '2 days'
  ),
  (
    'The server decides who owns a post',
    'The create route reads userId from a verified JWT payload instead of trusting an author identifier sent by the browser.',
    'published',
    1,
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '1 day',
    CURRENT_TIMESTAMP - INTERVAL '1 day'
  ),
  (
    'Draft: ideas for the next workshop',
    'This draft exists so the status filter has a second state to display during the classroom exercise.',
    'draft',
    1,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP,
    NULL
  );

COMMIT;
