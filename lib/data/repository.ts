import { boards, comments, jobs, jobSources, posts, profiles } from "@/lib/data/mock";
import type { Board, Job, Post } from "@/lib/types/domain";

export const boardGroups: Record<string, string> = {
  general: "전체 게시판",
  "laboratory-medicine": "진단검사의학",
  physiology: "생리기능",
  ultrasound: "초음파"
};

export function getCurrentUser() {
  return profiles[0];
}

export function getBoards() {
  return boards;
}

export function getBoardBySlug(slug: string): Board | undefined {
  return boards.find((board) => board.slug === slug);
}

export function getPosts(options?: { boardId?: string; query?: string; limit?: number; noticesOnly?: boolean }) {
  let result = [...posts];
  if (options?.boardId) result = result.filter((post) => post.boardId === options.boardId);
  if (options?.noticesOnly) result = result.filter((post) => post.isNotice);
  if (options?.query) {
    const query = options.query.toLowerCase();
    result = result.filter((post) => `${post.title} ${post.content} ${post.tags.join(" ")}`.toLowerCase().includes(query));
  }
  result.sort((a, b) => Number(Boolean(b.isNotice)) - Number(Boolean(a.isNotice)) || Date.parse(b.createdAt) - Date.parse(a.createdAt));
  return typeof options?.limit === "number" ? result.slice(0, options.limit) : result;
}

export function getPostById(id: string): Post | undefined {
  return posts.find((post) => post.id === id);
}

export function getPopularPosts(limit = 6) {
  return [...posts]
    .sort((a, b) => b.viewCount + b.likeCount * 8 + b.commentCount * 4 - (a.viewCount + a.likeCount * 8 + a.commentCount * 4))
    .slice(0, limit);
}

export function getCommentsByPostId(postId: string) {
  return comments.filter((comment) => comment.postId === postId);
}

export function getRecentComments(limit = 5) {
  return [...comments].sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)).slice(0, limit);
}

export function getJobs(options?: { region?: string; department?: string; sort?: "latest" | "deadline"; limit?: number }) {
  let result = [...jobs];
  if (options?.region) result = result.filter((job) => job.region.includes(options.region ?? ""));
  if (options?.department) result = result.filter((job) => job.department.includes(options.department ?? ""));
  result.sort((a, b) => {
    if (options?.sort === "deadline") return Date.parse(a.deadline) - Date.parse(b.deadline);
    return Date.parse(b.createdAt) - Date.parse(a.createdAt);
  });
  return typeof options?.limit === "number" ? result.slice(0, options.limit) : result;
}

export function getJobById(id: string): Job | undefined {
  return jobs.find((job) => job.id === id);
}

export function getJobSources() {
  return jobSources;
}

export function getPopularTags(limit = 10) {
  const counts = posts.flatMap((post) => post.tags).reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {});
  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }));
}
