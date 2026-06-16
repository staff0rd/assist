import { exec } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";
import { promisify } from "node:util";
import { respondJson } from "../../../shared/web";
import { getCwdParam } from "./getCwdParam";

const execAsync = promisify(exec);

export async function openInCode(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const cwd = getCwdParam(req, res);
	if (!cwd) return;
	try {
		// why: a windows-origin repo (C:\…) must open in Windows-native VS Code via interop; the WSL `code` shim can't open a C:\ path
		const command = /^[A-Za-z]:[\\/]/.test(cwd)
			? `cmd.exe /c code "${cwd}"`
			: `code "${cwd}"`;
		await execAsync(command);
		respondJson(res, 200, { ok: true });
	} catch {
		respondJson(res, 500, {
			error: "Failed to open VS Code. Is the 'code' command on your PATH?",
		});
	}
}
