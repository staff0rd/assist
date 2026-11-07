import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../test/mocks/childProcessMock";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const mockEngine = vi.hoisted(() => ({ engine: "claude" }));
vi.mock("./loadConfig", () => ({
	loadConfig: () => ({ harness: { engine: mockEngine.engine } }),
}));
vi.mock("./buildHarnessCodexArgs", () => ({
	buildHarnessCodexArgs: () => ({ args: [], env: {} }),
}));

import { resolveOneShotHarness, runOneShotPrompt } from "./runOneShotPrompt";

const mockExecFile = vi.mocked(execFile);

beforeEach(() => {
	vi.clearAllMocks();
	mockEngine.engine = "claude";
	vi.stubEnv("CODEX_TOOL_CALL_ID", undefined);
	vi.stubEnv("CODEX_THREAD_ID", undefined);
	mockExecFile.mockImplementation(((
		_file: string,
		_args: string[],
		_opts: unknown,
		cb: (e: unknown, r: unknown) => void,
	) => cb(null, { stdout: "answer\n", stderr: "" })) as never);
});

afterEach(() => {
	vi.unstubAllEnvs();
});

describe("resolveOneShotHarness", () => {
	it("defaults to Claude", () => {
		expect(resolveOneShotHarness()).toBe("claude");
	});

	it("follows the configured engine", () => {
		mockEngine.engine = "codex";
		expect(resolveOneShotHarness()).toBe("codex");
	});

	it("uses Codex when running inside a Codex agent", () => {
		vi.stubEnv("CODEX_THREAD_ID", "t1");
		expect(resolveOneShotHarness()).toBe("codex");
	});

	it("prefers an explicit harness and maps pi to Claude", () => {
		mockEngine.engine = "codex";
		expect(resolveOneShotHarness("claude")).toBe("claude");
		expect(resolveOneShotHarness("pi")).toBe("claude");
	});
});

describe("runOneShotPrompt", () => {
	it("runs claude -p on haiku by default", async () => {
		expect(await runOneShotPrompt("hi")).toBe("answer\n");
		expect(mockExecFile).toHaveBeenCalledWith(
			"claude",
			["-p", "--model", "haiku", "hi"],
			expect.objectContaining({ encoding: "utf8", timeout: 30_000 }),
			expect.any(Function),
		);
	});

	it("runs an ephemeral read-only codex exec detached from the tracked session", async () => {
		vi.stubEnv("ASSIST_SESSION_ID", "s1");
		vi.stubEnv("ASSIST_SESSION", "1");
		await runOneShotPrompt("hi", { harness: "codex" });
		const [file, args, opts] = mockExecFile.mock.calls[0] as unknown as [
			string,
			string[],
			{ cwd: string; env: NodeJS.ProcessEnv },
		];
		expect(file).toBe("codex");
		expect(args.slice(0, 2)).toEqual(["--no-daemon", "exec"]);
		expect(args).toEqual(
			expect.arrayContaining(["--ephemeral", "--sandbox", "read-only"]),
		);
		expect(args.at(-1)).toBe("hi");
		expect(opts.cwd).toBe(tmpdir());
		expect(opts.env.ASSIST_SESSION_ID).toBeUndefined();
		expect(opts.env.ASSIST_SESSION).toBeUndefined();
	});
});
