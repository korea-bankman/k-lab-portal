export type UserRole = "guest" | "member" | "manager" | "admin";

export type BoardGroup = "general" | "laboratory-medicine" | "physiology" | "ultrasound";

export type Board = {
  id: string;
  slug: string;
  name: string;
  group: BoardGroup;
  description: string;
  isNotice?: boolean;
};

export type Profile = {
  id: string;
  email: string;
  nickname: string;
  role: Exclude<UserRole, "guest">;
  department?: string;
  region?: string;
  createdAt: string;
};

export type Post = {
  id: string;
  boardId: string;
  title: string;
  content: string;
  authorId: string;
  authorName: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  tags: string[];
  isNotice?: boolean;
  createdAt: string;
  updatedAt: string;
};

export type Comment = {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: string;
};

export type JobSource = {
  id: string;
  name: string;
  baseUrl: string;
  apiReady: boolean;
  lastSyncedAt?: string;
};

export type Job = {
  id: string;
  hospitalName: string;
  department: string;
  region: string;
  experience: string;
  employmentType: string;
  deadline: string;
  originalUrl: string;
  sourceId: string;
  sourceName: string;
  description: string;
  createdAt: string;
};

export type Notification = {
  id: string;
  userId: string;
  title: string;
  isRead: boolean;
  createdAt: string;
};
