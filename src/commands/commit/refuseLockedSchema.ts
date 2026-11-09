import { execSync } from "node:child_process";
import { currentExecutionIdentity } from "../../shared/currentExecutionIdentity";
import { getProjectRoot } from "../../shared/loadConfig";
import { isSchemaLocked } from "../schema/isSchemaLocked";
import {
	isSchemaRelativePath,
	SCHEMA_LOCK_REASON,
} from "../schema/isSchemaPath";
import { listStagedFiles } from "./listStagedFiles";

function gitShow(spec: string, root: string): string {
	try {
		return execSync(`git show "${spec}"`, {
			cwd: root,
			encoding: "utf8",
			stdio: ["ignore", "pipe", "ignore"],
		});
	} catch {
		return "";
	}
}

function isStagedSchemaPath(rel: string, root: string): boolean {
	return isSchemaRelativePath(rel, root, [
		gitShow(`:${rel}`, root),
		gitShow(`HEAD:${rel}`, root),
	]);
}

export async function refuseLockedSchema(): Promise<void> {
	const identity = currentExecutionIdentity();
	if (!identity) return;
	const root = getProjectRoot();
	const staged = listStagedFiles().filter((rel) =>
		isStagedSchemaPath(rel, root),
	);
	if (staged.length === 0 || !(await isSchemaLocked(identity))) return;
	console.error(
		`Error: refusing to commit — staged changes touch database schema files: ${staged.join(", ")}`,
	);
	console.error(SCHEMA_LOCK_REASON);
	console.error(
		`Unstage them with \`git restore --staged ${staged.join(" ")}\`, then re-run the commit. Nothing was committed or pushed.`,
	);
	process.exit(1);
}
