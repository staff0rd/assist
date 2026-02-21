import { marked } from "marked";
import type { BacklogItem } from "../types";
import { AcceptanceCriteriaList } from "./AcceptanceCriteriaList";
import { BackButton } from "./BackButton";

type ItemDetailProps = {
	item: BacklogItem;
	onBack: () => void;
	onEdit: () => void;
};

function MarkdownBlock({ content }: { content: string }) {
	return (
		<div
			className="markdown"
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
		<div
			style={{
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				marginBottom: 16,
			}}
		>
			<BackButton onClick={onBack} />
			<button type="button" className="btn-secondary" onClick={onEdit}>
				Edit
			</button>
		</div>
	);
}

export function ItemDetail({ item, onBack, onEdit }: ItemDetailProps) {
	return (
		<>
			<DetailHeader onBack={onBack} onEdit={onEdit} />
			<div className="detail">
				<h2>{item.name}</h2>
				<div className="detail-id">
					#{item.id}{" "}
					<span className={`status-badge badge-${item.status}`}>
						{item.status}
					</span>
				</div>
				{item.description && (
					<div className="detail-section">
						<h3>Description</h3>
						<MarkdownBlock content={item.description} />
					</div>
				)}
				<AcceptanceCriteriaList criteria={item.acceptanceCriteria} />
			</div>
		</>
	);
}
