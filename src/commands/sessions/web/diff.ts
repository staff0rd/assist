import type { IncomingMessage, ServerResponse } from "node:http";
import { execGit } from "./execGit";
import { getCwdParam } from "./getCwdParam";

const MAX_DIFF_BYTES = 50 * 1024 * 1024;

async function untrackedFileDiff(cwd: string, path: string): Promise<string> {
	return execGit(cwd, ["diff", "--no-index", "--", "/dev/null", path], {
		maxBuffer: MAX_DIFF_BYTES,
		allowFailure: true,
	});
}

async function untrackedDiff(cwd: string): Promise<string> {
	const list = await execGit(cwd, [
		"ls-files",
		"--others",
		"--exclude-standard",
	]);
	const paths = list.split("\n").filter(Boolean);
	const diffs = await Promise.all(
		paths.map((path) => untrackedFileDiff(cwd, path)),
	);
	return diffs.join("");
}

export async function diff(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		const tracked = await execGit(cwd, ["diff", "HEAD"], {
			maxBuffer: MAX_DIFF_BYTES,
		});
		const untracked = await untrackedDiff(cwd);
		res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
		res.end(tracked + untracked);
	} catch {
		res.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
		res.end("");
	}
}
