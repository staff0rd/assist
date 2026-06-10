import { execSync } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";
import { respondJson } from "../../../shared/web";
import { getCwdParam } from "./getCwdParam";
import { parseGitStatus } from "./parseGitStatus";

export function gitStatus(req: IncomingMessage, res: ServerResponse): void {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		const output = execSync("git status --porcelain", {
			encoding: "utf-8",
			stdio: ["pipe", "pipe", "pipe"],
			cwd,
		});
		respondJson(res, 200, parseGitStatus(output));
	} catch {
		respondJson(res, 200, { new: [], modified: [], deleted: [] });
	}
}
