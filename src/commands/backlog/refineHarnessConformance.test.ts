import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type * as harnessAdapterModule from "../../shared/harnessAdapters/harnessAdapter";
import type {
	HarnessActivityIdentity,
	HarnessAdapter,
} from "../../shared/harnessAdapters/types";
import { unsupported } from "../../shared/harnessAdapters/unsupported";
import type { HarnessKind } from "../../shared/harnesses";

const state = vi.hoisted(() => ({
	transform: (adapter: HarnessAdapter): HarnessAdapter => adapter,
	fake: undefined as HarnessAdapter | undefined,
}));

vi.mock("node:crypto", () => ({ randomUUID: () => "uuid-1" }));
vi.mock("../../shared/pullIfConfigured", () => ({ pullIfConfigured: vi.fn() }));
vi.mock("../../shared/spawnInherit", () => ({
	spawnInherit: vi.fn(() => ({ child: {}, done: Promise.resolve(0) })),
}));
vi.mock("../../shared/emitActivity", () => ({ emitActivity: vi.fn() }));
vi.mock("./watchForMarker", () => ({
	watchForMarker: vi.fn(() => ({ killedOnMarker: () => false })),
	stopWatching: vi.fn(),
}));
vi.mock("./handleLaunchSignal", () => ({ handleLaunchSignal: vi.fn() }));
vi.mock("./loadItem", () => ({
	loadItem: vi.fn().mockResolvedValue({ name: "Item" }),
}));
vi.mock("./shared", () => ({
	getReady: vi.fn().mockResolvedValue({ orm: {} }),
}));
vi.mock("../../shared/harnessAdapters/detectHarness", () => ({
	detectHarness: () => ({ supported: true }),
}));
vi.mock("../sessions/daemon/ensureHooksSettings", () => ({
	ensureHooksSettings: () => "hooks.json",
}));
vi.mock("../../shared/buildHarnessCodexArgs", () => ({
	buildHarnessCodexArgs: () => ({ args: [], env: undefined }),
}));
vi.mock(
	"../../shared/harnessAdapters/harnessAdapter",
	async (importOriginal) => {
		const actual = await importOriginal<typeof harnessAdapterModule>();
		return {
			harnessAdapter: (kind: string) =>
				state.transform(
					kind === "fake" && state.fake
						? state.fake
						: actual.harnessAdapter(kind as HarnessKind),
				),
		};
	},
);

import { emitActivity } from "../../shared/emitActivity";
import { spawnInherit } from "../../shared/spawnInherit";
import { fakeHarnessMock } from "../../test/mocks/fakeHarnessMock";
import { refine } from "./refine";

state.fake = fakeHarnessMock();

const NUDGE = "carry on";

type Spawn = { command: string; argsEnd: string[] };

type Fixture = {
	harness: string;
	launch: Spawn;
	launchIdentity: HarnessActivityIdentity;
	resume:
		| { spawn: Spawn; identity: HarnessActivityIdentity }
		| { refusedWith: string };
};

const fixtures: Fixture[] = [
	{
		harness: "claude",
		launch: {
			command: "claude",
			argsEnd: [
				"--session-id",
				"uuid-1",
				"/refine a42",
				"--permission-mode",
				"auto",
			],
		},
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
		launch: {
			command: "codex",
			argsEnd: ["--sandbox", "workspace-write", "/refine a42"],
		},
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
		launch: { command: "pi", argsEnd: ["/refine a42"] },
		launchIdentity: { harness: "pi" },
		resume: { refusedWith: "pi sessions cannot be resumed yet" },
	},
	{
		harness: "fake",
		launch: { command: "fake-harness", argsEnd: ["run", "@refine a42"] },
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

function expectSpawned({ command, argsEnd }: Spawn) {
	expect(mockSpawn).toHaveBeenCalledTimes(1);
	const [spawned, args] = mockSpawn.mock.calls[0];
	expect(spawned).toBe(command);
	expect(args.slice(-argsEnd.length)).toEqual(argsEnd);
}

function expectRefused(errors: ReturnType<typeof vi.spyOn>, reason: string) {
	expect(mockSpawn).not.toHaveBeenCalled();
	expect(mockEmitActivity).not.toHaveBeenCalled();
	expect(process.exitCode).toBe(1);
	expect(String(errors.mock.calls[0]?.[0])).toContain(reason);
}

describe.each(fixtures)("Refine on the $harness adapter", (fixture) => {
	const harness = fixture.harness as HarnessKind;
	let errors: ReturnType<typeof vi.spyOn>;

	beforeEach(() => {
		vi.clearAllMocks();
		state.transform = (adapter) => adapter;
		process.env.ASSIST_RESUME_PROMPT = NUDGE;
		errors = vi.spyOn(console, "error").mockImplementation(() => {});
	});

	afterEach(() => {
		process.exitCode = undefined;
		delete process.env.ASSIST_RESUME_PROMPT;
		errors.mockRestore();
	});

	it("launches the refine skill through the adapter's native invocation", async () => {
		await refine("a42", { harness });

		expectSpawned(fixture.launch);
		expect(process.exitCode).toBeUndefined();
	});

	it("reports the adapter's conversation identity on the launch activity", async () => {
		await refine("a42", { harness });

		expect(mockEmitActivity).toHaveBeenCalledWith({
			kind: "command",
			name: "refine a42",
			itemId: expect.any(Number),
			itemName: "Item",
			...fixture.launchIdentity,
		});
	});

	it("resumes the conversation, or refuses before spawning when it cannot", async () => {
		await refine("a42", { harness, resumeSessionId: "conv-1" });

		if ("refusedWith" in fixture.resume) {
			expectRefused(errors, fixture.resume.refusedWith);
			return;
		}
		expectSpawned(fixture.resume.spawn);
		expect(mockEmitActivity).toHaveBeenCalledWith(
			expect.objectContaining(fixture.resume.identity),
		);
	});

	it("fails before spawning when the harness is not detected", async () => {
		state.transform = (adapter) => ({
			...adapter,
			detect: () => unsupported("not installed", "install it"),
		});

		await refine("a42", { harness });

		expectRefused(errors, "not installed");
	});

	it("fails closed when the adapter cannot run native skills", async () => {
		state.transform = (adapter) => ({
			...adapter,
			capabilities: {
				...adapter.capabilities,
				"skills.native": unsupported("no skills here", "add skills"),
			},
		});

		await refine("a42", { harness });

		expectRefused(errors, "Refine is unavailable");
		expect(String(errors.mock.calls[0]?.[0])).toContain("no skills here");
	});
});
