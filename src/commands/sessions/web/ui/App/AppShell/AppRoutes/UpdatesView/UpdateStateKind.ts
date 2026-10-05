export type UpdateStateKind =
	| "ok"
	| "ready"
	| "diverged"
	| "retrying"
	| "paused"
	| "off"
	| "unavailable";

export type UpdateState = {
	kind: UpdateStateKind;
	label: string;
	line: string;
};
