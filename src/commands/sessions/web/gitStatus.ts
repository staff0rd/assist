import { execFile } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";
import { promisify } from "node:util";
import { respondJson } from "../../../shared/web";
import { getCwdParam } from "./getCwdParam";
import { parseGitStatus } from "./parseGitStatus";

const execFileAsync = promisify(execFile);

export async function gitStatus(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		respondJson(res, 200, parseGitStatus(await runGitStatus(cwd)));
	} catch {
		respondJson(res, 200, { new: [], modified: [], deleted: [] });
	}
}

// why: a windows-origin repo (C:\…) must run git natively on Windows via interop — git over the /mnt mount walks the whole tree and takes >60s, wedging the server
function runGitStatus(cwd: string): Promise<string> {
	const args = ["status", "--porcelain"];
	const { file, argv } = /^[A-Za-z]:[\\/]/.test(cwd)
		? { file: "git.exe", argv: ["-C", cwd, ...args] }
		: { file: "git", argv: args };
	return execFileAsync(file, argv, {
		encoding: "utf-8",
		...(file === "git" ? { cwd } : {}),
	}).then((r) => r.stdout);
}
