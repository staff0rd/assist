import type { AddRuleRequest } from "./formatAddRuleCommand";

export function selectionActions<Pending extends { quote: string }, Comment>({
	path,
	pending,
	clear,
	onComment,
	onAddRule,
	build,
}: {
	path: string;
	pending: Pending | null;
	clear: () => void;
	onComment?: ((comment: Comment) => void) | undefined;
	onAddRule?: ((request: AddRuleRequest) => void) | undefined;
	build: (pending: Pending, note: string) => Comment;
}): {
	add: (note: string) => void;
	addRule: ((note: string) => void) | undefined;
} {
	const add = (note: string) => {
		if (pending && onComment) onComment(build(pending, note));
		clear();
	};

	const addRule = (note: string) => {
		if (pending && onAddRule) onAddRule({ path, quote: pending.quote, note });
		clear();
	};

	return { add, addRule: onAddRule ? addRule : undefined };
}
