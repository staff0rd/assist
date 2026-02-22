import { marked } from "marked";
import type { BacklogItem } from "../types";
import { AcceptanceCriteriaList } from "./AcceptanceCriteriaList";
import { BackButton } from "./BackButton";

type ItemDetailProps = {
	item: BacklogItem;
	onBack: () => void;
	onEdit: () => void;
};

const badgeColors: Record<string, string> = {
	todo: "bg-gray-100 text-gray-500",
	"in-progress": "bg-amber-100 text-amber-800",
	done: "bg-green-100 text-green-800",
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

function DetailHeader({
	onBack,
	onEdit,
}: {
	onBack: () => void;
	onEdit: () => void;
}) {
	return (
		<div className="flex justify-between items-center mb-4">
			<BackButton onClick={onBack} />
			<button
				type="button"
				className="bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md px-4 py-2 text-sm font-medium cursor-pointer"
				onClick={onEdit}
			>
				Edit
			</button>
		</div>
	);
}

export function ItemDetail({ item, onBack, onEdit }: ItemDetailProps) {
	return (
		<>
			<DetailHeader onBack={onBack} onEdit={onEdit} />
			<div className="bg-white rounded-lg p-6 border border-gray-200">
				<h2>{item.name}</h2>
				<div className="text-gray-400 text-sm mb-4">
					#{item.id}{" "}
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
		</>
	);
}
