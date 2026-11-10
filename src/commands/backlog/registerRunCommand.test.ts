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

vi.mock("./resolveHarness", () => ({
	resolveHarness: vi.fn((value?: string) => value ?? "codex"),
}));

import { pullIfConfigured } from "../../shared/pullIfConfigured";
import { registerRunCommand } from "./registerRunCommand";
import { resolveHarness } from "./resolveHarness";
import { run } from "./run";

const mockPull = pullIfConfigured as unknown as MockInstance;
const mockRun = run as unknown as MockInstance;
const mockResolveHarness = resolveHarness as unknown as MockInstance;

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
			harness: "codex",
			resumeSessionId: undefined,
		});
	});

	it("resolves the run type's default harness when --harness is omitted", async () => {
		await parse(["run", "42"]);

		expect(mockResolveHarness).toHaveBeenCalledWith(undefined, "run");
	});

	it("uses an explicit harness override", async () => {
		await parse(["run", "42", "--harness", "pi"]);

		expect(mockResolveHarness).toHaveBeenCalledWith("pi", "run");
		expect(mockRun).toHaveBeenCalledWith("42", {
			allowEdits: true,
			harness: "pi",
			resumeSessionId: undefined,
		});
	});

	it("forwards --write as enabled edits", async () => {
		await parse(["run", "42", "--harness", "codex", "--write"]);

		expect(mockRun).toHaveBeenCalledWith(
			"42",
			expect.objectContaining({ allowEdits: true, harness: "codex" }),
		);
	});

	it("forwards --no-write as disabled edits", async () => {
		await parse(["run", "42", "--harness", "codex", "--no-write"]);

		expect(mockRun).toHaveBeenCalledWith(
			"42",
			expect.objectContaining({ allowEdits: false, harness: "codex" }),
		);
	});

	it("describes write access consistently for every harness", () => {
		const help = buildCommand().commands[0]?.helpInformation();

		expect(help).toContain("Run the harness with write access (default)");
		expect(help).toContain("Run the harness without write access");
	});

	it("skips the pull when resuming an interrupted session on restore", async () => {
		await parse(["run", "42", "--resume-session", "sess-123"]);

		expect(mockPull).not.toHaveBeenCalled();
		expect(mockRun).toHaveBeenCalledWith("42", {
			allowEdits: true,
			harness: "codex",
			resumeSessionId: "sess-123",
		});
	});
});
