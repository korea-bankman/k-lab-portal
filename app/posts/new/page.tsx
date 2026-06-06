import { PostEditor } from "@/components/post-editor";

export default async function NewPostPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const { message } = await searchParams;
  return <PostEditor mode="new" message={message} />;
}
