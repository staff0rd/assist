import { isApprovedRead } from "../../shared/isApprovedRead";
import { getProjectRoot } from "../../shared/loadConfig";
import { splitCompound } from "../../shared/splitCompound";
import {
	isSchemaRelativePath,
	SCHEMA_LOCK_REASON,
} from "../schema/isSchemaPath";
import { isSedPrint } from "./isSedPrint";
import type { HookDecision } from "./resolvePermission";

const DB_PATH =
	/(?:^|[\s'"=(<>|;&:])(?:\.\/)?(src\/shared\/db\/[\w./-]*\.ts)(?![\w.-])/g;

function mentionedDbPaths(command: string, root: string): string[] {
	const normalizedRoot = `${root.replace(/\\/g, "/")}/`;
	const relativized = command
		.replace(/\\/g, "/")
		.split(normalizedRoot)
		.join("");
	return [...relativized.matchAll(DB_PATH)].map((match) => match[1]);
}

function writesSchema(
	toolName: string,
	rawCommand: string,
	root: string,
): boolean {
	const touchesSchema = (part: string) =>
		mentionedDbPaths(part, root).some((rel) =>
			isSchemaRelativePath(rel, root, [rawCommand]),
		);
	const result = splitCompound(rawCommand);
	if (!result.ok) return touchesSchema(rawCommand);
	return result.parts.some(
		(part) =>
			touchesSchema(part) &&
			!isApprovedRead(part, toolName) &&
			!isSedPrint(part),
	);
}

export function findSchemaPathDeny(
	toolName: string,
	rawCommand: string,
	root: string = getProjectRoot(),
): HookDecision | undefined {
	if (!writesSchema(toolName, rawCommand, root)) return undefined;
	return {
		permissionDecision: "deny",
		permissionDecisionReason: SCHEMA_LOCK_REASON,
	};
}
