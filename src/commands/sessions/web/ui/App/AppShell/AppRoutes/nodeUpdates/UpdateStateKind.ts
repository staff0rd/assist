export type UpdateStateKind =
	| "ok"
	| "ready"
	| "diverged"
	| "retrying"
	| "paused"
	| "off"
	| "failing"
	| "loading"
	| "unavailable";

export type UpdateState = {
	kind: UpdateStateKind;
	label: string;
	line: string;
};
