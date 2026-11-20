import type { RunConfig } from "../../shared/types";

export type RunEntrySource =
	| { kind: "global"; path: string }
	| { kind: "user" }
	| { kind: "repo"; from: "db" | "yml" }
	| { kind: "project"; path: string };

export type SourcedRunConfig = { config: RunConfig; source: RunEntrySource };
