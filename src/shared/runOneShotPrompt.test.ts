import { execFile } from "node:child_process";
import { tmpdir } from "node:os";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../test/mocks/childProcessMock";
import type * as harnessAdapterModule from "./harnessAdapters/harnessAdapter";
import type { HarnessAdapter } from "./harnessAdapters/types";
import type { HarnessKind } from "./harnesses";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const state = vi.hoisted(() => ({
	engine: "claude",
	missing: new Set<string>(),
	fake: undefined as HarnessAdapter | undefined,
}));
vi.mock("./loadConfig", () => ({
	loadConfig: () => ({ harness: { engine: state.engine } }),
}));
vi.mock("./buildHarnessCodexArgs", () => ({
	buildHarnessCodexArgs: () => ({ args: [], env: {} }),
}));
vi.mock("./harnessAdapters/detectHarness", () => ({
	detectHarness: (kind: string) =>
		state.missing.has(kind)
			? {
					supported: false,
					reason: `${kind} is not installed`,
					remediation: `install ${kind}`,
				}
			: { supported: true },
}));
vi.mock("./harnessAdapters/harnessAdapter", async (importOriginal) => {
	const actual = await importOriginal<typeof harnessAdapterModule>();
	return {
		harnessAdapter: (kind: string) =>
			kind === "fake" && state.fake
				? state.fake
				: actual.harnessAdapter(kind as HarnessKind),
	};
});

import { fakeHarnessMock } from "../test/mocks/fakeHarnessMock";
import {
	sessionTitleFeature,
	branchSlugFeature,
} from "./harnessAdapters/harnessFeatures";
import {
	OneShotUnavailableError,
	resolveOneShotHarness,
	runOneShotPrompt,
} from "./runOneShotPrompt";

const mockExecFile = vi.mocked(execFile);

beforeEach(() => {
	vi.clearAllMocks();
	state.engine = "claude";
	state.missing.clear();
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

	it("follows the configured engine, including pi", () => {
		state.engine = "codex";
		expect(resolveOneShotHarness()).toBe("codex");
		state.engine = "pi";
		expect(resolveOneShotHarness()).toBe("pi");
	});

	it("uses Codex when running inside a Codex agent", () => {
		vi.stubEnv("CODEX_THREAD_ID", "t1");
		expect(resolveOneShotHarness()).toBe("codex");
	});

	it("prefers an explicit harness", () => {
		state.engine = "codex";
		expect(resolveOneShotHarness("claude")).toBe("claude");
		expect(resolveOneShotHarness("pi")).toBe("pi");
	});
});

describe("runOneShotPrompt", () => {
	it("runs claude -p on haiku by default", async () => {
		expect(await runOneShotPrompt("hi", branchSlugFeature)).toBe("answer\n");
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
		await runOneShotPrompt("hi", sessionTitleFeature, { harness: "codex" });
		const [file, args, opts] = mockExecFile.mock.calls[0] as unknown as [
			string,
			string[],
			{ cwd: string; env: NodeJS.ProcessEnv; timeout: number },
		];
		expect(file).toBe("codex");
		expect(args.slice(0, 2)).toEqual(["--no-daemon", "exec"]);
		expect(args).toEqual(
			expect.arrayContaining(["--ephemeral", "--sandbox", "read-only"]),
		);
		expect(args.at(-1)).toBe("hi");
		expect(opts.cwd).toBe(tmpdir());
		expect(opts.timeout).toBe(30_000);
		expect(opts.env.ASSIST_SESSION_ID).toBeUndefined();
		expect(opts.env.ASSIST_SESSION).toBeUndefined();
	});

	it("passes a caller's timeout through", async () => {
		await runOneShotPrompt("hi", branchSlugFeature, { timeout: 5 });
		expect(mockExecFile).toHaveBeenCalledWith(
			"claude",
			expect.any(Array),
			expect.objectContaining({ timeout: 5 }),
			expect.any(Function),
		);
	});

	it("runs Codex with Claude absent", async () => {
		state.missing.add("claude");
		state.engine = "codex";
		expect(await runOneShotPrompt("hi", branchSlugFeature)).toBe("answer\n");
		expect(mockExecFile.mock.calls.map(([file]) => file)).toEqual(["codex"]);
	});

	it("refuses pi with the declared reason instead of falling back to Claude", async () => {
		await expect(
			runOneShotPrompt("hi", sessionTitleFeature, { harness: "pi" }),
		).rejects.toThrow(OneShotUnavailableError);
		await expect(
			runOneShotPrompt("hi", sessionTitleFeature, { harness: "pi" }),
		).rejects.toThrow(/Session title generation is unavailable on pi/);
		expect(mockExecFile).not.toHaveBeenCalled();
	});

	it("refuses an undetected harness without spawning", async () => {
		state.missing.add("claude");
		await expect(runOneShotPrompt("hi", branchSlugFeature)).rejects.toThrow(
			/claude is not installed/,
		);
		expect(mockExecFile).not.toHaveBeenCalled();
	});

	it("runs a fake harness through its adapter alone", async () => {
		const calls = { interactive: [], oneShot: [] as string[] };
		state.fake = fakeHarnessMock(calls);
		const answer = await runOneShotPrompt("hello", branchSlugFeature, {
			harness: "fake" as HarnessKind,
		});
		expect(answer).toBe("fake answer to 5 chars\n");
		expect(calls.oneShot).toEqual(["hello"]);
		expect(mockExecFile).not.toHaveBeenCalled();
	});
});
