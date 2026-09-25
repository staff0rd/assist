import { CommentUnavailablePopover } from "./FileCommentPopover/CommentUnavailablePopover";
import type { PendingComment } from "../PendingComment";
import { ruleCitationNote } from "../ruleCitationNote";
import { SelectionCommentPopover } from "../SelectionCommentPopover";

export function FileCommentPopover({
	pending,
	cwd,
	path,
	unavailable,
	onAdd,
	onAddRule,
	onCancel,
}: {
	pending: PendingComment | null;
	cwd: string | undefined;
	path: string;
	unavailable: string | undefined;
	onAdd: (note: string) => void;
	onAddRule: ((note: string) => void) | undefined;
	onCancel: () => void;
}) {
	if (unavailable)
		return (
			<CommentUnavailablePopover
				pending={pending}
				message={unavailable}
				onClose={onCancel}
			/>
		);

	return (
		<SelectionCommentPopover
			pending={pending}
			cwd={cwd}
			path={path}
			onAdd={onAdd}
			onCite={(rule) => onAdd(ruleCitationNote(rule))}
			onAddRule={onAddRule}
			onCancel={onCancel}
		/>
	);
}
