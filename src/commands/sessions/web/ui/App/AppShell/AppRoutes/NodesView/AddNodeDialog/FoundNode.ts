export type FoundNode = { name: string; version: string; url: string };

export type AddNodeStep =
	| { kind: "idle" }
	| { kind: "checking" }
	| { kind: "found"; node: FoundNode }
	| { kind: "linking"; node: FoundNode };
