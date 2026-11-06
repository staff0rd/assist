import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { TestflightError } from "./TestflightError";

const run = promisify(execFile);

export async function readAscKey(reference: string): Promise<string> {
	if (!reference.startsWith("op://"))
		throw new TestflightError(
			"testflight.keyRef must be a 1Password reference starting with op://",
		);
	try {
		const { stdout } = await run("op", ["read", reference]);
		return stdout.trim();
	} catch (error) {
		const reason =
			(error as { stderr?: string }).stderr?.trim() ||
			(error instanceof Error ? error.message : String(error));
		throw new TestflightError(
			`Failed to read testflight.keyRef from 1Password (is op installed and signed in?): ${reason}`,
		);
	}
}
