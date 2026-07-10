import type { Activity } from "../../../shared/emitActivity";

export type CommandType = "claude" | "run" | "assist";

export type SessionInfoBase = {
	id: string;
	name: string;
	title?: string;
	subtitle?: string;
	commandType: CommandType;
	startedAt: number;
	runName?: string;
	assistArgs?: string[];
	cwd?: string;
	restored?: boolean;
	error?: string;
	activity?: Activity;
	autoRun?: boolean;
	autoAdvance?: boolean;
	starred?: boolean;
	totalIn?: number;
	totalOut?: number;
};
