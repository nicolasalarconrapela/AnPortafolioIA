export interface User {
  id: string;
  email: string;
  name: string;
  role: "candidate" | "recruiter";
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RegisterPayload extends LoginPayload {
  name: string;
}
