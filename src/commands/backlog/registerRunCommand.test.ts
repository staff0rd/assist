import { Command } from "commander";
import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("../../shared/pullIfConfigured", () => ({
	pullIfConfigured: vi.fn(),
}));

vi.mock("./run", () => ({
	run: vi.fn().mockResolvedValue(true),
}));

import { pullIfConfigured } from "../../shared/pullIfConfigured";
import { registerRunCommand } from "./registerRunCommand";
import { run } from "./run";

const mockPull = pullIfConfigured as unknown as MockInstance;
const mockRun = run as unknown as MockInstance;

function buildCommand(): Command {
	const program = new Command();
	registerRunCommand(program);
	return program;
}

async function parse(args: string[]): Promise<void> {
	await buildCommand().parseAsync(["node", "assist", ...args]);
}

describe("registerRunCommand", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it("pulls before a fresh run", async () => {
		await parse(["run", "42"]);

		expect(mockPull).toHaveBeenCalledTimes(1);
		expect(mockRun).toHaveBeenCalledWith("42", {
			allowEdits: true,
			resumeSessionId: undefined,
		});
	});

	it("skips the pull when resuming an interrupted session on restore", async () => {
		await parse(["run", "42", "--resume-session", "sess-123"]);

		expect(mockPull).not.toHaveBeenCalled();
		expect(mockRun).toHaveBeenCalledWith("42", {
			allowEdits: true,
			resumeSessionId: "sess-123",
		});
	});
});
