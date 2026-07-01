import { execFile } from "node:child_process";
import { readFileSync } from "node:fs";
import type { IncomingMessage, ServerResponse } from "node:http";
import { homedir } from "node:os";
import { basename, join } from "node:path";
import { promisify } from "node:util";
import { respondJson } from "../../../shared/web";
import { findSynthesisForBranch } from "./findSynthesisForBranch";
import { getCwdParam } from "./getCwdParam";
import { windowsCwdToWslPath } from "./windowsCwdToWslPath";

const execFileAsync = promisify(execFile);

function runGit(cwd: string, args: string[]): Promise<string> {
	return execFileAsync("git", args, {
		encoding: "utf8",
		cwd: windowsCwdToWslPath(cwd),
	}).then((r) => r.stdout.trim());
}

async function resolveSynthesisPath(cwd: string): Promise<string | null> {
	const [repoRoot, branch] = await Promise.all([
		runGit(cwd, ["rev-parse", "--show-toplevel"]),
		runGit(cwd, ["rev-parse", "--abbrev-ref", "HEAD"]),
	]);
	const repoReviewsDir = join(
		homedir(),
		".assist",
		"reviews",
		basename(repoRoot),
	);
	return findSynthesisForBranch(repoReviewsDir, branch);
}

export async function getReviewSynthesis(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		const path = await resolveSynthesisPath(cwd);
		if (!path) {
			respondJson(res, 404, { error: "No synthesis found" });
			return;
		}
		respondJson(res, 200, { synthesis: readFileSync(path, "utf8") });
	} catch {
		respondJson(res, 404, { error: "No synthesis found" });
	}
}
