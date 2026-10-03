import { spawn } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../test/mocks/childProcessMock";
import { spawnInherit } from "./spawnInherit";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

const spawnMock = vi.mocked(spawn);

function lastEnv() {
	const [, , opts] = spawnMock.mock.lastCall as [
		string,
		string[],
		{ env: Record<string, string | undefined> },
	];
	return opts.env;
}

describe("spawnInherit", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		spawnMock.mockReturnValue({ on: vi.fn() } as never);
	});

	afterEach(() => {
		vi.unstubAllEnvs();
	});

	it("strips ASSIST_ACTIVITY_ID and CLAUDE_CODE_CHILD_SESSION from the child env", () => {
		vi.stubEnv("ASSIST_ACTIVITY_ID", "act-1");
		vi.stubEnv("CLAUDE_CODE_CHILD_SESSION", "1");

		spawnInherit("codex", []);

		expect(lastEnv()).not.toHaveProperty("ASSIST_ACTIVITY_ID");
		expect(lastEnv()).not.toHaveProperty("CLAUDE_CODE_CHILD_SESSION");
	});

	it("merges extra env over the parent env", () => {
		vi.stubEnv("KEEP_ME", "parent");
		vi.stubEnv("OVERRIDE_ME", "parent");

		spawnInherit("codex", [], { env: { OVERRIDE_ME: "child", ADDED: "1" } });

		expect(lastEnv()).toMatchObject({
			KEEP_ME: "parent",
			OVERRIDE_ME: "child",
			ADDED: "1",
		});
	});
});
