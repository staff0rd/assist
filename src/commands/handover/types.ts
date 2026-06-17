import type { Db } from "../../shared/db/Db";

export type LoadInput = {
	session_id?: string;
	cwd?: string;
	hook_event_name?: string;
};

export type LoadOptions = {
	stdin?: () => Promise<string>;
	cwdFallback?: string;
	orm?: Db;
};

export type ResolvedOptions = {
	stdin: () => Promise<string>;
	cwdFallback: string;
};
