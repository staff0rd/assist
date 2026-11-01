import { isDocsLocked } from "../backlog/isDocsLocked";
import {
	DOCS_LOCK_REASON,
	isLockedDocsRelativePath,
} from "../backlog/isDocsPath";
import { listStagedFiles } from "./listStagedFiles";

export async function refuseLockedDocs(): Promise<void> {
	const staged = listStagedFiles().filter(isLockedDocsRelativePath);
	if (staged.length === 0 || !(await isDocsLocked())) return;
	console.error(
		`Error: refusing to commit — staged changes touch docs: ${staged.join(", ")}`,
	);
	console.error(DOCS_LOCK_REASON);
	console.error(
		`Unstage them with \`git restore --staged ${staged.join(" ")}\`, then re-run the commit. Nothing was committed or pushed.`,
	);
	process.exit(1);
}
