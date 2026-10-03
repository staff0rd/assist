import { type ChildProcess, spawn } from "node:child_process";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as childProcessMockModule from "../../test/mocks/childProcessMock";
import { runStreamingChild } from "./runStreamingChild";

vi.mock("node:child_process", async () =>
	(
		await vi.importActual<typeof childProcessMockModule>(
			"../../test/mocks/childProcessMock",
		)
	).childProcessMock(),
);

vi.mock("./waitForChildExit", () => ({
	waitForChildExit: vi.fn(async () => ({
		exitCode: 0,
		stderr: "",
		stdout: "",
		elapsedMs: 1,
	})),
}));

function run(extra: { model?: string; quiet?: boolean }) {
	return runStreamingChild({
		name: "codex",
		command: "codex",
		args: [],
		stdin: "",
		onLine: () => {},
		...extra,
	});
}

describe("runStreamingChild", () => {
	beforeEach(() => {
		vi.mocked(spawn).mockReturnValue({} as ChildProcess);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it("names the model on the starting line when one is in use", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		await run({ model: "azure/gpt-5.6-sol" });

		expect(log).toHaveBeenCalledWith("[codex (azure/gpt-5.6-sol)] starting");
	});

	it("leaves the starting line bare when there is no model", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		await run({});

		expect(log).toHaveBeenCalledWith("[codex] starting");
	});

	it("prints no starting line when quiet", async () => {
		const log = vi.spyOn(console, "log").mockImplementation(() => {});

		await run({ model: "azure/gpt-5.6-sol", quiet: true });

		expect(log).not.toHaveBeenCalled();
	});
});
