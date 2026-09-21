import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll } from "vitest";

const storeDir = mkdtempSync(join(tmpdir(), "assist-test-store-"));
process.env.ASSIST_STORE_DIR = storeDir;

function clearResumeEnvInheritedFromADaemonResumedSession() {
	delete process.env.ASSIST_RESUME_PROMPT;
	delete process.env.ASSIST_RESUME_IDLE;
}

clearResumeEnvInheritedFromADaemonResumedSession();

afterAll(() => {
	rmSync(storeDir, { recursive: true, force: true });
});
