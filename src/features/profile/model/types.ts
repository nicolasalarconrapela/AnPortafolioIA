export interface Profile {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  role: "candidate" | "recruiter";
}

export interface UpdateProfilePayload {
  name?: string;
  bio?: string;
  avatarUrl?: string;
}
