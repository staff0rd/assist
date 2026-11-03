import type { ReactNode } from "react";
import { fileCommentFrom } from "./FileCommentLayer/fileCommentFrom";
import type { AddRuleRequest } from "./formatAddRuleCommand";
import type { FileComment } from "./formatFileComment";
import { SelectionCommentLayer } from "./SelectionCommentLayer";
import { selectionActions } from "./selectionActions";
import { usePreviewSelection } from "./usePreviewSelection";

export function FileCommentLayer({
	path,
	cwd,
	source,
	onComment,
	onAddRule,
	unavailable,
	children,
}: {
	path: string;
	cwd: string | undefined;
	source: string;
	onComment?: ((comment: FileComment) => void) | undefined;
	onAddRule?: ((request: AddRuleRequest) => void) | undefined;
	unavailable?: string | undefined;
	children: ReactNode;
}) {
	const selection = usePreviewSelection();
	const { add, addRule } = selectionActions({
		path,
		pending: selection.pending,
		clear: selection.clear,
		onComment,
		onAddRule,
		build: (pending, note) => fileCommentFrom(path, source, pending, note),
	});

	return (
		<SelectionCommentLayer
			selection={selection}
			path={path}
			cwd={cwd}
			unavailable={unavailable}
			onAdd={add}
			onAddRule={addRule}
		>
			{children}
		</SelectionCommentLayer>
	);
}
