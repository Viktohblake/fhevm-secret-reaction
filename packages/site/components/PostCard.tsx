import { ReactionBar } from "./ReactionBar";

export function PostCard({ title, body, slug }:{ title:string; body:string; slug:string }) {
  return (
    <div className="rounded-xl border p-4 bg-white">
      <h3 className="text-xl font-semibold">{title}</h3>
      <p className="text-gray-700 mb-3">{body}</p>
      <ReactionBar slug={slug} />
    </div>
  );
}
