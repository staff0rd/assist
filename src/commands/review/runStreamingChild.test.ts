import { afterEach, describe, expect, it, vi } from "vitest";
import { runStreamingChild } from "./runStreamingChild";

vi.mock("node:child_process", () => ({ spawn: vi.fn(() => ({})) }));

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
