import { execSync } from "node:child_process";
import { getProjectRoot } from "../../shared/loadConfig";
import { isDocsLocked } from "../backlog/isDocsLocked";
import { DOCS_LOCK_REASON } from "../backlog/isDocsPath";

function findStagedDocs(): string[] {
	return execSync("git diff --cached --name-only --relative", {
		cwd: getProjectRoot(),
		encoding: "utf8",
	})
		.split("\n")
		.filter((path) => path.startsWith("docs/"));
}

export async function refuseLockedDocs(): Promise<void> {
	const staged = findStagedDocs();
	if (staged.length === 0 || !(await isDocsLocked())) return;
	console.error(
		`Error: refusing to commit — staged changes touch docs: ${staged.join(", ")}`,
	);
	console.error(DOCS_LOCK_REASON);
	console.error(
		"Unstage them with `git restore --staged docs/`, then re-run the commit. Nothing was committed or pushed.",
	);
	process.exit(1);
}
