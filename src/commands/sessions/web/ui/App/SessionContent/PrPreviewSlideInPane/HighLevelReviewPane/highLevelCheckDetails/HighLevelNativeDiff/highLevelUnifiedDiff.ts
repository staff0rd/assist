import type { HighLevelFileStatus } from "../../../../../../../../../review/highLevel/types";

const NULL_PATH = "/dev/null";

export function highLevelUnifiedDiff(
	path: string,
	status: HighLevelFileStatus,
	patch: string,
): string {
	const from = status === "added" ? NULL_PATH : `a/${path}`;
	const to = status === "removed" ? NULL_PATH : `b/${path}`;
	return [
		`diff --git a/${path} b/${path}`,
		`--- ${from}`,
		`+++ ${to}`,
		patch,
		"",
	].join("\n");
}
