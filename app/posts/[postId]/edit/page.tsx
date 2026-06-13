import { notFound } from "next/navigation";
import { PostEditor } from "@/components/post-editor";
import { getPostById } from "@/lib/data/repository";
import { getSupabasePostById } from "@/lib/data/supabase-repository";

export default async function EditPostPage({ params, searchParams }: { params: Promise<{ postId: string }>; searchParams: Promise<{ message?: string }> }) {
  const { postId } = await params;
  const { message } = await searchParams;
  const post = await getSupabasePostById(postId) ?? getPostById(postId);
  if (!post) notFound();
  return <PostEditor mode="edit" post={post} message={message} />;
}
