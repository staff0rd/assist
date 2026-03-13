export type View =
	| { kind: "list" }
	| { kind: "detail"; id: number }
	| { kind: "add" }
	| { kind: "edit"; id: number };
