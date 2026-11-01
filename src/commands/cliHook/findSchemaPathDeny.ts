import { isApprovedRead } from "../../shared/isApprovedRead";
import { getProjectRoot } from "../../shared/loadConfig";
import { splitCompound } from "../../shared/splitCompound";
import {
	isSchemaRelativePath,
	SCHEMA_LOCK_REASON,
} from "../schema/isSchemaPath";
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

export function findSchemaPathDeny(
	toolName: string,
	rawCommand: string,
	root: string = getProjectRoot(),
): HookDecision | undefined {
	const result = splitCompound(rawCommand);
	const parts = result.ok ? result.parts : [rawCommand];
	const writes = parts.some(
		(part) =>
			mentionedDbPaths(part, root).some((rel) =>
				isSchemaRelativePath(rel, root, [rawCommand]),
			) && !isApprovedRead(part, toolName),
	);
	if (!writes) return undefined;
	return {
		permissionDecision: "deny",
		permissionDecisionReason: SCHEMA_LOCK_REASON,
	};
}
