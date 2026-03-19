import { marked } from "marked";
import type { BacklogItem } from "../types";
import { AcceptanceCriteriaList } from "./AcceptanceCriteriaList";
import { StatusPicker } from "./StatusPicker";

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

export function ItemBody({
	item,
	onStatusChange,
}: {
	item: BacklogItem;
	onStatusChange?: (status: BacklogItem["status"]) => void;
}) {
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
				<StatusPicker current={item.status} onStatusChange={onStatusChange} />
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
