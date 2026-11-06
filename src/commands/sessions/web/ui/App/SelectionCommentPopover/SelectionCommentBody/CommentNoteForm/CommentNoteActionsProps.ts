export type CommentNoteActionsProps = {
	disabled: boolean;
	unavailable?: string | undefined;
	onAdd: () => void;
	onQueue?: (() => void) | undefined;
	onAddRule?: (() => void) | undefined;
	onCancel: () => void;
	onCollapse?: (() => void) | undefined;
};
