import { marked } from "marked";
import type { BacklogItem } from "../types";
import { AcceptanceCriteriaList } from "./AcceptanceCriteriaList";

const badgeColors: Record<string, string> = {
	todo: "bg-gray-100 text-gray-500",
	"in-progress": "bg-amber-100 text-amber-800",
	done: "bg-green-100 text-green-800",
};

const typeBadgeColors: Record<string, string> = {
	story: "bg-blue-100 text-blue-700",
	bug: "bg-red-100 text-red-700",
};

function MarkdownBlock({ content }: { content: string }) {
	return (
		<div
			className="markdown leading-relaxed"
			// biome-ignore lint/security/noDangerouslySetInnerHtml: markdown rendering requires innerHTML
			dangerouslySetInnerHTML={{ __html: marked.parse(content) as string }}
		/>
	);
}

export function ItemBody({ item }: { item: BacklogItem }) {
	return (
		<div className="bg-white rounded-lg p-6 border border-gray-200">
			<h2>{item.name}</h2>
			<div className="text-gray-400 text-sm mb-4 flex items-center gap-2">
				#{item.id}
				<span
					className={`inline-block rounded-full px-2.5 text-xs font-medium ${typeBadgeColors[item.type]}`}
				>
					{item.type}
				</span>
				<span
					className={`inline-block rounded-full px-2.5 text-xs font-medium ${badgeColors[item.status]}`}
				>
					{item.status}
				</span>
			</div>
			{item.description && (
				<div className="mb-4">
					<h3 className="text-xs uppercase text-gray-500 mb-2 tracking-wide">
						Description
					</h3>
					<MarkdownBlock content={item.description} />
				</div>
			)}
			<AcceptanceCriteriaList criteria={item.acceptanceCriteria} />
		</div>
	);
}
