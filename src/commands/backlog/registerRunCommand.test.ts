import { Command } from "commander";
import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("../../shared/loadConfigFrom", () => ({
	loadMergedRawConfig: vi.fn(() => ({})),
}));
vi.mock("../../shared/checkCliAvailable", () => ({
	checkCliAvailable: vi.fn((command: string) => command === "codex"),
}));

vi.mock("../../shared/pullIfConfigured", () => ({
	pullIfConfigured: vi.fn(),
}));

vi.mock("./run", () => ({
	run: vi.fn().mockResolvedValue(true),
}));

vi.mock("../../shared/loadConfig", async () =>
	(
		await vi.importActual<typeof loadConfigMockModule>(
			"../../test/mocks/loadConfigMock",
		)
	).loadConfigMock(),
);

import { loadConfig } from "../../shared/loadConfig";
import { pullIfConfigured } from "../../shared/pullIfConfigured";
import {
	type AssistConfigInput,
	makeAssistConfig,
} from "../../test/mothers/makeAssistConfig";
import type * as loadConfigMockModule from "../../test/mocks/loadConfigMock";
import { registerRunCommand } from "./registerRunCommand";
import { run } from "./run";

const mockPull = pullIfConfigured as unknown as MockInstance;
const mockRun = run as unknown as MockInstance;

function withHarness(harness: AssistConfigInput["harness"]): void {
	vi.mocked(loadConfig).mockReturnValue(makeAssistConfig({ harness }));
}

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
		withHarness({ engine: "codex" });
	});

	it("replays the web Build and phone Start command on a node without Claude", async () => {
		withHarness({});
		await parse(["run", "42"]);
		expect(mockRun).toHaveBeenCalledWith(
			"42",
			expect.objectContaining({ harness: "codex" }),
		);
	});

	it("pulls before a fresh run", async () => {
		await parse(["run", "42"]);

		expect(mockPull).toHaveBeenCalledTimes(1);
		expect(mockRun).toHaveBeenCalledWith("42", {
			allowEdits: true,
			harness: "codex",
			model: undefined,
			resumeSessionId: undefined,
		});
	});

	describe("harness.defaults.run", () => {
		beforeEach(() =>
			withHarness({
				engine: "claude",
				defaults: { run: { harness: "codex", model: "gpt-5" } },
			}),
		);

		it("launches with the run type's harness and model when no flags are given", async () => {
			await parse(["run", "42"]);

			expect(mockRun).toHaveBeenCalledWith(
				"42",
				expect.objectContaining({ harness: "codex", model: "gpt-5" }),
			);
		});

		it("lets --model override the configured model", async () => {
			await parse(["run", "42", "--model", "o3"]);

			expect(mockRun).toHaveBeenCalledWith(
				"42",
				expect.objectContaining({ harness: "codex", model: "o3" }),
			);
		});

		it("drops the configured model when --harness picks another harness", async () => {
			await parse(["run", "42", "--harness", "claude"]);

			expect(mockRun).toHaveBeenCalledWith(
				"42",
				expect.objectContaining({ harness: "claude", model: undefined }),
			);
		});

		it("passes no model with --no-model", async () => {
			await parse(["run", "42", "--no-model"]);

			expect(mockRun).toHaveBeenCalledWith(
				"42",
				expect.objectContaining({ harness: "codex", model: undefined }),
			);
		});
	});

	it("passes no model when the run type has none configured", async () => {
		withHarness({ engine: "claude", defaults: { run: { harness: "pi" } } });

		await parse(["run", "42"]);

		expect(mockRun).toHaveBeenCalledWith(
			"42",
			expect.objectContaining({ harness: "pi", model: undefined }),
		);
	});

	it("uses an explicit harness override", async () => {
		await parse(["run", "42", "--harness", "pi"]);

		expect(mockRun).toHaveBeenCalledWith("42", {
			allowEdits: true,
			harness: "pi",
			model: undefined,
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
			model: undefined,
			resumeSessionId: "sess-123",
		});
	});
});
