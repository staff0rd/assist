import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { cleanOpStderr } from "./cleanOpStderr";

const run = promisify(execFile);

export type OpResult =
	| { ok: true; stdout: string }
	| { ok: false; error: string; missing: boolean };

export type OpRunner = (args: string[]) => Promise<OpResult>;

export const runOp: OpRunner = async (args) => {
	try {
		const { stdout } = await run("op", args, { maxBuffer: 10 * 1024 * 1024 });
		return { ok: true, stdout };
	} catch (error) {
		const { code, stderr } = error as { code?: unknown; stderr?: string };
		if (code === "ENOENT")
			return {
				ok: false,
				error: "the 1Password CLI (op) is not installed or not on PATH",
				missing: false,
			};
		const reason =
			cleanOpStderr(stderr ?? "") ||
			(error instanceof Error ? error.message : String(error));
		return {
			ok: false,
			error: reason,
			missing: /isn't an item|isn't a vault/i.test(reason),
		};
	}
};
