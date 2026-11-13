export type TreeRemoval =
	| { removed: true }
	| { removed: false; reason: string; deferred?: boolean };
