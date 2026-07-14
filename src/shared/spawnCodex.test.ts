import { spawn } from "node:child_process";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { spawnCodex } from "./spawnCodex";

vi.mock("node:child_process", () => ({
	spawn: vi.fn(() => ({ on: vi.fn() })),
}));

const spawnMock = spawn as unknown as ReturnType<typeof vi.fn>;

function lastCall() {
	return spawnMock.mock.lastCall as [
		string,
		string[],
		{ env: Record<string, string | undefined> },
	];
}

describe("spawnCodex", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("launches codex with -C <cwd> and the prompt, defaulting cwd to process.cwd()", () => {
		spawnCodex("/refine a279");

		const [command, args] = lastCall();
		expect(command).toBe("codex");
		expect(args).toEqual(["-C", process.cwd(), "/refine a279"]);
	});

	it("honours an explicit cwd", () => {
		spawnCodex("/refine a279", { cwd: "/repo/x" });

		const [, args] = lastCall();
		expect(args).toEqual(["-C", "/repo/x", "/refine a279"]);
	});

	it("strips ASSIST_ACTIVITY_ID and CLAUDE_CODE_CHILD_SESSION from the child env", () => {
		vi.stubEnv("ASSIST_ACTIVITY_ID", "act-1");
		vi.stubEnv("CLAUDE_CODE_CHILD_SESSION", "1");

		spawnCodex("/refine a279");

		const [, , opts] = lastCall();
		expect(opts.env).not.toHaveProperty("ASSIST_ACTIVITY_ID");
		expect(opts.env).not.toHaveProperty("CLAUDE_CODE_CHILD_SESSION");
		vi.unstubAllEnvs();
	});
});
