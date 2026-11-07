import type { ScopedRule } from "../../../../../../rules/types";

export type PhoneCommentComposerProps = {
	quote: string | undefined;
	initialNote: string;
	editing: boolean;
	cwd: string | undefined;
	unavailable: string | undefined;
	onAdd: (note: string) => void;
	onQueue: (note: string) => void;
	onCite: ((rule: ScopedRule) => void) | undefined;
	onAddRule: ((note: string) => void) | undefined;
	onCancel: () => void;
};
