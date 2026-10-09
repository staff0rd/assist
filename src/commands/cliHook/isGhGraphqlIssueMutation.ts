import { readFileSync } from "node:fs";

const ISSUE_MUTATION =
	/\bmutation\b[\s\S]*(?:issue|comment|label|assign|reaction|milestone)/i;
const FIELD_FLAGS = ["-f", "-F", "--field", "--raw-field"];

export function isGhGraphqlIssueMutation(
	args: string[],
	command: string,
): boolean {
	if (!args.some((arg) => unquote(arg) === "graphql")) return false;
	return querySources(args).some((source) =>
		ISSUE_MUTATION.test(readSourceOrCommandText(source, command)),
	);
}

function querySources(args: string[]): string[] {
	const sources: string[] = [];
	for (let i = 0; i < args.length; i++) {
		const value = flagValue(args, i);
		if (value === undefined) continue;
		if (args[i] === "--input") sources.push(`@${value}`);
		const query = /^query=([\s\S]*)$/.exec(value);
		if (query) sources.push(query[1]);
	}
	return sources;
}

function flagValue(args: string[], i: number): string | undefined {
	const arg = args[i];
	if (arg === "--input") return unquote(args[i + 1] ?? "");
	for (const flag of FIELD_FLAGS) {
		if (arg === flag) return unquote(args[i + 1] ?? "");
		if (arg.startsWith(`${flag}=`)) return unquote(arg.slice(flag.length + 1));
		if (flag.length === 2 && arg.length > 2 && arg.startsWith(flag))
			return unquote(arg.slice(2));
	}
	return undefined;
}

function readSourceOrCommandText(source: string, command: string): string {
	if (!source.startsWith("@")) return source;
	const path = source.slice(1);
	if (path === "-") return command;
	try {
		return readFileSync(path, "utf8");
	} catch {
		return command;
	}
}

function unquote(value: string): string {
	return value.replace(/['"]/g, "");
}
