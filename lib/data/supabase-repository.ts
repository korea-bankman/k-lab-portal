import { createClient } from "@/lib/supabase/server";
import type { Board, BoardGroup, Comment, Job, Notification, Post } from "@/lib/types/domain";

type BoardRow = {
  id: string;
  slug: string;
  name: string;
  board_group: string;
  description: string;
  is_notice: boolean;
};

type PostRow = {
  id: string;
  board_id: string;
  title: string;
  content: string;
  author_id: string;
  view_count: number;
  like_count: number;
  comment_count: number;
  is_notice: boolean;
  created_at: string;
  updated_at: string;
  profiles?: { nickname: string } | null;
};

type JobRow = {
  id: string;
  hospital_name: string;
  department: string;
  region: string;
  experience: string;
  employment_type: string;
  deadline: string;
  original_url: string;
  source_id: string | null;
  description: string;
  created_at: string;
  job_sources?: { name: string } | null;
};

type CommentRow = {
  id: string;
  post_id: string;
  author_id: string;
  content: string;
  created_at: string;
  profiles?: { nickname: string } | null;
};

export type ReportItem = {
  id: string;
  postId: string;
  commentId: string | null;
  reason: string;
  status: string;
  createdAt: string;
  reporterName: string;
  postTitle: string;
  boardId: string;
};

type ReportRow = {
  id: string;
  post_id: string;
  comment_id: string | null;
  reason: string;
  status: string;
  created_at: string;
  profiles?: { nickname: string } | null;
  posts?: { title: string; board_id: string } | null;
};

type NotificationRow = {
  id: string;
  user_id: string;
  title: string;
  link_url: string | null;
  is_read: boolean;
  created_at: string;
};

function mapBoard(row: BoardRow): Board {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    group: row.board_group as BoardGroup,
    description: row.description,
    isNotice: row.is_notice
  };
}

function mapPost(row: PostRow): Post {
  return {
    id: row.id,
    boardId: row.board_id,
    title: row.title,
    content: row.content,
    authorId: row.author_id,
    authorName: row.profiles?.nickname ?? "회원",
    viewCount: row.view_count,
    likeCount: row.like_count,
    commentCount: row.comment_count,
    tags: [],
    isNotice: row.is_notice,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapJob(row: JobRow): Job {
  return {
    id: row.id,
    hospitalName: row.hospital_name,
    department: row.department,
    region: row.region,
    experience: row.experience,
    employmentType: row.employment_type,
    deadline: row.deadline,
    originalUrl: row.original_url,
    sourceId: row.source_id ?? "",
    sourceName: row.job_sources?.name ?? "외부 채용",
    description: row.description,
    createdAt: row.created_at
  };
}

function mapComment(row: CommentRow): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    authorId: row.author_id,
    authorName: row.profiles?.nickname ?? "회원",
    content: row.content,
    createdAt: row.created_at
  };
}

export async function getSupabaseBoards() {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("boards")
    .select("id, slug, name, board_group, description, is_notice")
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as BoardRow[]).map(mapBoard);
}

export async function getSupabaseBoardBySlug(slug: string) {
  const boards = await getSupabaseBoards();
  return boards.find((board) => board.slug === slug);
}

export async function getSupabasePosts(options?: { boardId?: string; query?: string; limit?: number }) {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("posts")
    .select("id, board_id, title, content, author_id, view_count, like_count, comment_count, is_notice, created_at, updated_at, profiles(nickname)")
    .is("hidden_at", null)
    .is("deleted_at", null)
    .order("is_notice", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.boardId) {
    query = query.eq("board_id", options.boardId);
  }

  if (options?.query) {
    query = query.or(`title.ilike.%${options.query}%,content.ilike.%${options.query}%`);
  }

  if (typeof options?.limit === "number") {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) {
    return getSupabasePostsWithoutProfiles(options);
  }
  return (data as unknown as PostRow[]).map(mapPost);
}

export async function getSupabasePostById(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("posts")
    .select("id, board_id, title, content, author_id, view_count, like_count, comment_count, is_notice, created_at, updated_at, profiles(nickname)")
    .eq("id", id)
    .is("hidden_at", null)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) {
    return getSupabasePostByIdWithoutProfile(id);
  }
  return mapPost(data as unknown as PostRow);
}

async function getSupabasePostsWithoutProfiles(options?: { boardId?: string; query?: string; limit?: number }) {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("posts")
    .select("id, board_id, title, content, author_id, view_count, like_count, comment_count, is_notice, created_at, updated_at")
    .is("hidden_at", null)
    .is("deleted_at", null)
    .order("is_notice", { ascending: false })
    .order("created_at", { ascending: false });

  if (options?.boardId) {
    query = query.eq("board_id", options.boardId);
  }

  if (options?.query) {
    query = query.or(`title.ilike.%${options.query}%,content.ilike.%${options.query}%`);
  }

  if (typeof options?.limit === "number") {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as unknown as PostRow[]).map(mapPost);
}

async function getSupabasePostByIdWithoutProfile(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("posts")
    .select("id, board_id, title, content, author_id, view_count, like_count, comment_count, is_notice, created_at, updated_at")
    .eq("id", id)
    .is("hidden_at", null)
    .is("deleted_at", null)
    .maybeSingle();

  if (error || !data) return null;
  return mapPost(data as unknown as PostRow);
}

export async function getSupabaseJobs(options?: { region?: string; department?: string; sort?: "latest" | "deadline"; limit?: number }) {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("jobs")
    .select("id, hospital_name, department, region, experience, employment_type, deadline, original_url, source_id, description, created_at, job_sources(name)");

  if (options?.region) {
    query = query.ilike("region", `%${options.region}%`);
  }

  if (options?.department) {
    query = query.ilike("department", `%${options.department}%`);
  }

  if (options?.sort === "deadline") {
    query = query.order("deadline", { ascending: true });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (typeof options?.limit === "number") {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) return [];
  return (data as unknown as JobRow[]).map(mapJob);
}

export async function getSupabaseJobById(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("jobs")
    .select("id, hospital_name, department, region, experience, employment_type, deadline, original_url, source_id, description, created_at, job_sources(name)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapJob(data as unknown as JobRow);
}

export async function getSupabaseCommentsByPostId(postId: string) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, author_id, content, created_at, profiles(nickname)")
    .eq("post_id", postId)
    .is("hidden_at", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: true });

  if (error || !data) return [];
  return (data as unknown as CommentRow[]).map(mapComment);
}

export async function getSupabaseRecentComments(limit = 5) {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("comments")
    .select("id, post_id, author_id, content, created_at, profiles(nickname)")
    .is("hidden_at", null)
    .is("deleted_at", null)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as unknown as CommentRow[]).map(mapComment);
}

export async function getOpenReports(options?: { boardIds?: string[]; limit?: number }) {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("reports")
    .select("id, post_id, comment_id, reason, status, created_at, profiles(nickname), posts(title, board_id)")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  if (typeof options?.limit === "number") {
    query = query.limit(options.limit);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  const boardIds = options?.boardIds ? new Set(options.boardIds) : null;
  return (data as unknown as ReportRow[])
    .filter((row) => !boardIds || boardIds.has(row.posts?.board_id ?? ""))
    .map((row) => ({
      id: row.id,
      postId: row.post_id,
      commentId: row.comment_id,
      reason: row.reason,
      status: row.status,
      createdAt: row.created_at,
      reporterName: row.profiles?.nickname ?? "회원",
      postTitle: row.posts?.title ?? "게시글",
      boardId: row.posts?.board_id ?? ""
    }));
}

export async function getSupabaseNotifications(userId: string, limit = 10): Promise<Notification[]> {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("notifications")
    .select("id, user_id, title, link_url, is_read, created_at")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error || !data) return [];
  return (data as NotificationRow[]).map((row) => ({
    id: row.id,
    userId: row.user_id,
    title: row.title,
    linkUrl: row.link_url ?? undefined,
    isRead: row.is_read,
    createdAt: row.created_at
  }));
}
