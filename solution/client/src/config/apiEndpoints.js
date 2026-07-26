export const API_ENDPOINTS = {
  register: "/auth/register",
  login: "/auth/login",
  listPosts: "/posts",
  createPost: "/posts",
  getPost: (postId) => `/posts/${postId}`,
  updatePost: (postId) => `/posts/${postId}`,
  deletePost: (postId) => `/posts/${postId}`,
};
