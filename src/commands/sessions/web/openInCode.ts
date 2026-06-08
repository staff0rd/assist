import { exec } from "node:child_process";
import type { IncomingMessage, ServerResponse } from "node:http";
import { promisify } from "node:util";
import { respondJson } from "../../../shared/web";

const execAsync = promisify(exec);

export async function openInCode(
	req: IncomingMessage,
	res: ServerResponse,
): Promise<void> {
	const url = new URL(req.url ?? "/", "http://localhost");
	const cwd = url.searchParams.get("cwd");
	if (!cwd) {
		respondJson(res, 400, { error: "Missing cwd" });
		return;
	}
	try {
		await execAsync(`code "${cwd}"`);
		respondJson(res, 200, { ok: true });
	} catch {
		respondJson(res, 500, {
			error: "Failed to open VS Code. Is the 'code' command on your PATH?",
		});
	}
}
