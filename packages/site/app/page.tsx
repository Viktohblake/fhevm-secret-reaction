import { POSTS } from "@/lib/data";
import { PostCard } from "@/components/PostCard";

export default function Page() {
  return (
    <div className="grid gap-4 mx-4">
      <h1 className="text-2xl font-bold">Secret Reactions</h1>
      <p className="text-gray-700">React privately; decrypt totals when authorized.</p>

      <div className="grid gap-4">
        {POSTS.map(p => <PostCard key={p.slug} {...p} />)}
      </div>
    </div>
  );
}
