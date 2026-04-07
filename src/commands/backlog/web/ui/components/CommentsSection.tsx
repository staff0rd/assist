import type { BacklogComment } from "../types";

const typeStyles: Record<BacklogComment["type"], string> = {
	summary: "bg-amber-50 border-amber-200",
	comment: "bg-gray-50 border-gray-200",
};

const typeLabels: Record<BacklogComment["type"], string> = {
	summary: "Phase summary",
	comment: "Comment",
};

function formatTimestamp(ts: string): string {
	const d = new Date(ts);
	return d.toLocaleDateString(undefined, {
		year: "numeric",
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function CommentCard({ comment }: { comment: BacklogComment }) {
	return (
		<div className={`border rounded-md p-3 ${typeStyles[comment.type]}`}>
			<div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
				{comment.id !== undefined && (
					<span className="text-gray-400">#{comment.id}</span>
				)}
				<span className="font-medium">{typeLabels[comment.type]}</span>
				{comment.phase !== undefined && <span>· Phase {comment.phase}</span>}
				<span>· {formatTimestamp(comment.timestamp)}</span>
			</div>
			<p className="text-sm text-gray-800 whitespace-pre-wrap">
				{comment.text}
			</p>
		</div>
	);
}

export function CommentsSection({ comments }: { comments: BacklogComment[] }) {
	if (comments.length === 0) return null;
	return (
		<div className="mb-4">
			<h3 className="text-xs uppercase text-gray-500 mb-2 tracking-wide">
				Comments
			</h3>
			<div className="space-y-2">
				{comments.map((c, i) => (
					<CommentCard key={`${c.timestamp}-${i}`} comment={c} />
				))}
			</div>
		</div>
	);
}
