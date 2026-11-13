import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterAll, vi } from "vitest";

vi.mock("@testing-library/react", async (importOriginal) => {
	const actual =
		await importOriginal<typeof import("@testing-library/react")>();
	const { withDesignTheme } = await import("./src/test/withDesignTheme");
	return {
		...actual,
		render: ((ui, options) =>
			actual.render(ui, {
				...options,
				wrapper: withDesignTheme(options?.wrapper),
			})) as typeof actual.render,
		renderHook: ((hook, options) =>
			actual.renderHook(hook, {
				...options,
				wrapper: withDesignTheme(options?.wrapper),
			})) as typeof actual.renderHook,
	};
});

vi.mock("./src/shared/prepareCodexHookTrust", () => ({
	prepareCodexHookTrust: () => undefined,
}));

vi.mock("./src/shared/harnessAdapters/codexHookProbe", () => ({
	codexHookProbe: () => ({ supported: true }),
}));

vi.mock("./src/shared/harnessAdapters/piExtensionProbe", () => ({
	piExtensionProbe: () => ({ supported: true }),
}));

vi.mock("./src/commands/sessions/daemon/worktree/docker", () => ({
	docker: vi.fn(() => Promise.reject(new Error("docker is not run in tests"))),
}));

const storeDir = mkdtempSync(join(tmpdir(), "assist-test-store-"));
process.env.ASSIST_STORE_DIR = storeDir;
process.env.ASSIST_WATCHER_LOG_DIR = join(storeDir, "watchers");

function clearResumeEnvInheritedFromADaemonResumedSession() {
	delete process.env.ASSIST_RESUME_PROMPT;
	delete process.env.ASSIST_RESUME_IDLE;
}

clearResumeEnvInheritedFromADaemonResumedSession();

afterAll(async () => {
	rmSync(storeDir, { recursive: true, force: true });
	const key = Symbol.for("assist.sharedTestPglite");
	const holder = globalThis as Record<
		symbol,
		{ close(): Promise<void> } | undefined
	>;
	await holder[key]?.close();
	delete holder[key];
});
