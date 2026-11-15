export type NodeSearchEnv = {
	home: string;
	env: Record<string, string | undefined>;
	platform: NodeJS.Platform;
};

type ResolvedNode = { path: string; binDir: string; version: string };

export type NodeSpecResolution =
	| { ok: true; node: ResolvedNode }
	| { ok: false; error: string };

export type ResolveNodeDeps = NodeSearchEnv & {
	current: { path: string; version: string };
	versionOf: (path: string) => string;
};
