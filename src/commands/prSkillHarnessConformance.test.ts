import { Command } from "commander";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as harnessAdapterModule from "../shared/harnessAdapters/harnessAdapter";
import type {
	HarnessActivityIdentity,
	HarnessAdapter,
} from "../shared/harnessAdapters/types";
import { unsupported } from "../shared/harnessAdapters/unsupported";
import type { HarnessKind } from "../shared/harnesses";

const state = vi.hoisted(() => ({
	transform: (adapter: HarnessAdapter): HarnessAdapter => adapter,
	fake: undefined as HarnessAdapter | undefined,
	missing: new Set<string>(),
	engine: "claude",
	calls: [] as string[],
}));

vi.mock("node:crypto", () => ({ randomUUID: () => "uuid-1" }));
vi.mock("../shared/spawnInherit", () => ({
	spawnInherit: vi.fn((command: string) => {
		state.calls.push(command);
		return { child: {}, done: Promise.resolve(0) };
	}),
}));
vi.mock("../shared/emitActivity", () => ({ emitActivity: vi.fn() }));
vi.mock("./review/checkoutPr", () => ({
	checkoutPr: vi.fn(() => {
		state.calls.push("checkout");
	}),
}));
vi.mock("../shared/loadConfig", () => ({
	loadConfig: () => ({ harness: { engine: state.engine } }),
}));
vi.mock("../shared/harnessAdapters/detectHarness", () => ({
	detectHarness: (kind: string) =>
		state.missing.has(kind)
			? unsupported(`${kind} is not installed`, `install ${kind}`)
			: { supported: true },
}));
vi.mock("./sessions/daemon/ensureHooksSettings", () => ({
	ensureHooksSettings: () => "hooks.json",
}));
vi.mock("../shared/buildHarnessCodexArgs", () => ({
	buildHarnessCodexArgs: () => ({ args: [], env: undefined }),
}));
vi.mock("../shared/harnessAdapters/harnessAdapter", async (importOriginal) => {
	const actual = await importOriginal<typeof harnessAdapterModule>();
	return {
		harnessAdapter: (kind: string) =>
			state.transform(
				kind === "fake" && state.fake
					? state.fake
					: actual.harnessAdapter(kind as HarnessKind),
			),
	};
});

import { emitActivity } from "../shared/emitActivity";
import { spawnInherit } from "../shared/spawnInherit";
import { fakeHarnessMock } from "../test/mocks/fakeHarnessMock";
import { fixConflict } from "./fixConflict";
import { registerFixConflict } from "./registerFixConflict";
import { registerReviewPrComments } from "./registerReviewPrComments";
import { reviewPrComments } from "./reviewPrComments";

state.fake = fakeHarnessMock();

const NUDGE = "carry on";

type Workflow = {
	name: string;
	skill: string;
	label: string;
	run: (harness: HarnessKind, resumeSessionId?: string) => Promise<void>;
	launchText: { slash: string; codex: string; fake: string[] };
};

const workflows: Workflow[] = [
	{
		name: "fix-conflict --rebase",
		skill: "fix-conflict",
		label: "Fix conflicts",
		run: (harness, resumeSessionId) =>
			fixConflict("7", { rebase: true, harness, resumeSessionId }),
		launchText: {
			slash: "/fix-conflict --rebase",
			codex: "$fix-conflict --rebase",
			fake: ["run", "@fix-conflict", "--rebase"],
		},
	},
	{
		name: "review-pr-comments --auto --announce",
		skill: "review-pr-comments",
		label: "Address comments",
		run: (harness, resumeSessionId) =>
			reviewPrComments("7", {
				auto: true,
				announce: true,
				harness,
				resumeSessionId,
			}),
		launchText: {
			slash: "/review-pr-comments --auto --announce 7",
			codex: "$review-pr-comments --auto --announce 7",
			fake: ["run", "@review-pr-comments", "--auto --announce 7"],
		},
	},
];

type Spawn = { command: string; argsEnd: string[] };

type Fixture = {
	harness: string;
	launch: (w: Workflow) => Spawn;
	launchIdentity: HarnessActivityIdentity;
	resume:
		| { spawn: Spawn; identity: HarnessActivityIdentity }
		| { refusedWith: string };
};

const fixtures: Fixture[] = [
	{
		harness: "claude",
		launch: (w) => ({
			command: "claude",
			argsEnd: [
				"--session-id",
				"uuid-1",
				w.launchText.slash,
				"--permission-mode",
				"auto",
			],
		}),
		launchIdentity: { claudeSessionId: "uuid-1" },
		resume: {
			spawn: {
				command: "claude",
				argsEnd: ["--resume", "conv-1", NUDGE, "--permission-mode", "auto"],
			},
			identity: { claudeSessionId: "conv-1" },
		},
	},
	{
		harness: "codex",
		launch: (w) => ({
			command: "codex",
			argsEnd: ["--sandbox", "workspace-write", w.launchText.codex],
		}),
		launchIdentity: { harness: "codex" },
		resume: {
			spawn: {
				command: "codex",
				argsEnd: ["--sandbox", "workspace-write", "resume", "conv-1", NUDGE],
			},
			identity: { harness: "codex", harnessSessionId: "conv-1" },
		},
	},
	{
		harness: "pi",
		launch: (w) => ({
			command: "pi",
			argsEnd: ["--tui-mode", "regular", w.launchText.slash],
		}),
		launchIdentity: { harness: "pi" },
		resume: { refusedWith: "pi sessions cannot be resumed yet" },
	},
	{
		harness: "fake",
		launch: (w) => ({ command: "fake-harness", argsEnd: w.launchText.fake }),
		launchIdentity: {},
		resume: {
			spawn: {
				command: "fake-harness",
				argsEnd: ["continue", "conv-1", NUDGE],
			},
			identity: { harnessSessionId: "conv-1" },
		},
	},
];

const mockSpawn = vi.mocked(spawnInherit);
const mockEmitActivity = vi.mocked(emitActivity);
let errors: ReturnType<typeof vi.spyOn>;

function expectSpawned({ command, argsEnd }: Spawn) {
	expect(mockSpawn).toHaveBeenCalledTimes(1);
	const [spawned, args] = mockSpawn.mock.calls[0];
	expect(spawned).toBe(command);
	expect(args.slice(-argsEnd.length)).toEqual(argsEnd);
}

function expectRefused(reason: string) {
	expect(state.calls).toEqual([]);
	expect(mockEmitActivity).not.toHaveBeenCalled();
	expect(process.exitCode).toBe(1);
	expect(String(errors.mock.calls[0]?.[0])).toContain(reason);
}

beforeEach(() => {
	vi.clearAllMocks();
	state.transform = (adapter) => adapter;
	state.missing.clear();
	state.engine = "claude";
	state.calls.length = 0;
	process.env.ASSIST_RESUME_PROMPT = NUDGE;
	errors = vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
	process.exitCode = undefined;
	delete process.env.ASSIST_RESUME_PROMPT;
	errors.mockRestore();
});

describe.each(workflows)("$name", (workflow) => {
	describe.each(fixtures)("on the $harness adapter", (fixture) => {
		const harness = fixture.harness as HarnessKind;

		it("checks the PR out, then launches the skill through the adapter's native invocation", async () => {
			await workflow.run(harness);

			expect(state.calls[0]).toBe("checkout");
			expectSpawned(fixture.launch(workflow));
			expect(process.exitCode).toBeUndefined();
		});

		it("reports the adapter's conversation identity on the launch activity", async () => {
			await workflow.run(harness);

			expect(mockEmitActivity).toHaveBeenCalledWith({
				kind: "command",
				name: workflow.skill,
				...fixture.launchIdentity,
			});
		});

		it("resumes the conversation without checking out again, or refuses before spawning", async () => {
			await workflow.run(harness, "conv-1");

			if ("refusedWith" in fixture.resume) {
				expectRefused(fixture.resume.refusedWith);
				return;
			}
			expect(state.calls).not.toContain("checkout");
			expectSpawned(fixture.resume.spawn);
			expect(mockEmitActivity).toHaveBeenCalledWith(
				expect.objectContaining(fixture.resume.identity),
			);
		});

		it("fails before checking out when the harness is not detected", async () => {
			state.transform = (adapter) => ({
				...adapter,
				detect: () => unsupported("not installed", "install it"),
			});

			await workflow.run(harness);

			expectRefused("not installed");
		});

		it("fails closed when the adapter cannot run native skills", async () => {
			state.transform = (adapter) => ({
				...adapter,
				capabilities: {
					...adapter.capabilities,
					"skills.native": unsupported("no skills here", "add skills"),
				},
			});

			await workflow.run(harness);

			expectRefused(`${workflow.label} is unavailable`);
			expect(String(errors.mock.calls[0]?.[0])).toContain("no skills here");
		});

		it("reports a launch failure with the harness name and exits non-zero", async () => {
			mockSpawn.mockReturnValueOnce({
				child: {} as never,
				done: Promise.reject(new Error("ENOENT")),
			});

			await workflow.run(harness);

			expect(process.exitCode).toBe(1);
			expect(String(errors.mock.calls[0]?.[0])).toMatch(
				new RegExp(`Failed to launch .+ for /${workflow.skill}: ENOENT`),
			);
		});
	});

	it("runs on Codex without the Claude executable", async () => {
		state.missing.add("claude");

		await workflow.run("codex");

		expect(state.calls).toEqual(["checkout", "codex"]);
		expect(process.exitCode).toBeUndefined();
	});

	it("refuses Codex when it is missing instead of falling back to Claude", async () => {
		state.missing.add("codex");

		await workflow.run("codex");

		expectRefused("codex is not installed");
	});
});

describe("CLI harness selection", () => {
	function program() {
		const command = new Command().exitOverride();
		registerFixConflict(command, "resume");
		registerReviewPrComments(command, "resume");
		return command;
	}

	it.each([
		["fix-conflict", "7"],
		["review-pr-comments", "7"],
	])("defaults %s to the configured harness.engine", async (...args) => {
		state.engine = "codex";

		await program().parseAsync(["node", "assist", ...args]);

		expect(state.calls).toEqual(["checkout", "codex"]);
	});

	it.each([
		["fix-conflict", "7", "--harness", "claude"],
		["review-pr-comments", "7", "--harness", "claude"],
	])("honours an explicit --harness over the engine: %s", async (...args) => {
		state.engine = "codex";

		await program().parseAsync(["node", "assist", ...args]);

		expect(state.calls).toEqual(["checkout", "claude"]);
	});
});
