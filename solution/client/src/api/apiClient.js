import axios from "axios";

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:4000",
  timeout: 10000,
});

apiClient.interceptors.request.use((request) => {
  const token = localStorage.getItem("blog-studio-token");

  if (token) {
    request.headers.Authorization = `Bearer ${token}`;
  }

  return request;
});

export class EndpointNotConfiguredError extends Error {
  constructor(endpointName) {
    super(`Connect the "${endpointName}" endpoint in apiEndpoints.js.`);
    this.name = "EndpointNotConfiguredError";
  }
}

export function requireEndpoint(endpointName, endpointValue) {
  if (typeof endpointValue !== "string" || endpointValue.trim() === "") {
    throw new EndpointNotConfiguredError(endpointName);
  }

  return endpointValue;
}

export function isEndpointReady(endpointValue) {
  return typeof endpointValue === "string" && endpointValue.trim() !== "";
}

export function getRequestErrorMessage(error) {
  if (error instanceof EndpointNotConfiguredError) {
    return error.message;
  }

  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  if (error.code === "ECONNABORTED") {
    return "The request took too long. Check that the API is running.";
  }

  return "Could not reach the API. Check the server and endpoint path.";
}
