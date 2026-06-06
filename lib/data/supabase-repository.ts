import { createClient } from "@/lib/supabase/server";
import type { Board, BoardGroup, Post } from "@/lib/types/domain";

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
  profiles: { nickname: string } | null;
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

export async function getSupabasePostById(id: string) {
  const supabase = await createClient();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from("posts")
    .select("id, board_id, title, content, author_id, view_count, like_count, comment_count, is_notice, created_at, updated_at, profiles(nickname)")
    .eq("id", id)
    .maybeSingle();

  if (error || !data) return null;
  return mapPost(data as unknown as PostRow);
}
