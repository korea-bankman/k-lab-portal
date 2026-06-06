import { notFound } from "next/navigation";
import { PostEditor } from "@/components/post-editor";
import { getPostById } from "@/lib/data/repository";

export default async function EditPostPage({ params }: { params: Promise<{ postId: string }> }) {
  const { postId } = await params;
  const post = getPostById(postId);
  if (!post) notFound();
  return <PostEditor mode="edit" post={post} />;
}
