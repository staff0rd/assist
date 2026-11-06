import { readFileSync } from "node:fs";

const ISSUE_MUTATION =
	/\bmutation\b[\s\S]*(?:issue|comment|review|label|assign|reaction|milestone)/i;
const FILE_REFERENCE = /(?:=@|--input[\s=]+)["']?([^\s"';&|)]+)/g;

export function isGhGraphqlIssueMutation(command: string): boolean {
	if (!command.includes("graphql")) return false;
	if (ISSUE_MUTATION.test(command)) return true;
	return [...command.matchAll(FILE_REFERENCE)].some((m) =>
		ISSUE_MUTATION.test(readOrEmpty(m[1])),
	);
}

function readOrEmpty(path: string): string {
	try {
		return readFileSync(path, "utf8");
	} catch {
		return "";
	}
}
