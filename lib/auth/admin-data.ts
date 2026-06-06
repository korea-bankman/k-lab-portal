import { createClient } from "@/lib/supabase/server";
import type { AuthProfile } from "@/lib/auth/profile";

export type ManagerBoardPermission = {
  id: string;
  managerId: string;
  boardId: string;
  boardName: string;
  boardSlug: string;
};

export async function getAllProfiles() {
  const supabase = await createClient();
  if (!supabase) return [];

  const { data, error } = await supabase
    .from("profiles")
    .select("id, email, nickname, role, department, region")
    .order("created_at", { ascending: false });

  if (error || !data) return [];
  return data as AuthProfile[];
}

export async function getManagerBoardPermissions(managerId?: string) {
  const supabase = await createClient();
  if (!supabase) return [];

  let query = supabase
    .from("manager_board_permissions")
    .select("id, manager_id, board_id, boards(name, slug)")
    .order("created_at", { ascending: false });

  if (managerId) {
    query = query.eq("manager_id", managerId);
  }

  const { data, error } = await query;
  if (error || !data) return [];

  return data.map((row) => {
    const board = Array.isArray(row.boards) ? row.boards[0] : row.boards;
    return {
      id: row.id,
      managerId: row.manager_id,
      boardId: row.board_id,
      boardName: board?.name ?? "게시판",
      boardSlug: board?.slug ?? "free"
    };
  }) as ManagerBoardPermission[];
}
