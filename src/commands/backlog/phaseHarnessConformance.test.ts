import { beforeEach, describe, expect, it, vi } from "vitest";
import type * as harnessAdapterModule from "../../shared/harnessAdapters/harnessAdapter";
import type {
	HarnessActivityIdentity,
	HarnessAdapter,
} from "../../shared/harnessAdapters/types";
import type { HarnessKind } from "../../shared/harnesses";
import { makeBacklogItem } from "../../test/mothers/makeBacklogItem";

const state = vi.hoisted(() => ({
	fake: undefined as HarnessAdapter | undefined,
}));

vi.mock("node:crypto", () => ({ randomUUID: () => "uuid-1" }));
vi.mock("../../shared/spawnInherit", () => ({
	spawnInherit: vi.fn(() => ({ child: {}, done: Promise.resolve(0) })),
}));
vi.mock("../../shared/emitActivity", () => ({ emitActivity: vi.fn() }));
vi.mock("./watchForMarker", () => ({
	watchForMarker: vi.fn(),
	stopWatching: vi.fn(),
}));
vi.mock("./persistPhaseSessionId", () => ({ persistPhaseSessionId: vi.fn() }));
vi.mock("./persistPhaseSession", () => ({ persistPhaseSession: vi.fn() }));
vi.mock("./verifyPhaseResume", () => ({
	verifyPhaseResume: vi.fn(() => Promise.resolve(true)),
}));
vi.mock("./buildPhasePrompt", () => ({
	buildPhasePrompt: () => "PHASE_PROMPT",
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
				kind === "fake" && state.fake
					? state.fake
					: actual.harnessAdapter(kind as HarnessKind),
		};
	},
);

import { emitActivity } from "../../shared/emitActivity";
import { spawnInherit } from "../../shared/spawnInherit";
import { fakeHarnessMock } from "../../test/mocks/fakeHarnessMock";
import { launchPhaseSession } from "./launchPhaseSession";
import { persistPhaseSessionId } from "./persistPhaseSessionId";
import { preparePhaseSession } from "./preparePhaseSession";

state.fake = fakeHarnessMock();

const NUDGE = "carry on";

type Fixture = {
	harness: string;
	launchArgsEnd: string[];
	readOnlyArgsEnd: string[];
	launchIdentity: HarnessActivityIdentity;
	resume?: { argsEnd: string[]; identity: HarnessActivityIdentity };
};

const fixtures: Fixture[] = [
	{
		harness: "claude",
		launchArgsEnd: [
			"--session-id",
			"uuid-1",
			"PHASE_PROMPT",
			"--permission-mode",
			"auto",
		],
		readOnlyArgsEnd: ["--session-id", "uuid-1", "PHASE_PROMPT"],
		launchIdentity: { claudeSessionId: "uuid-1" },
		resume: {
			argsEnd: ["--resume", "conv-1", NUDGE, "--permission-mode", "auto"],
			identity: { claudeSessionId: "conv-1" },
		},
	},
	{
		harness: "codex",
		launchArgsEnd: ["--sandbox", "workspace-write", "PHASE_PROMPT"],
		readOnlyArgsEnd: ["--sandbox", "read-only", "PHASE_PROMPT"],
		launchIdentity: { harness: "codex" },
		resume: {
			argsEnd: ["--sandbox", "workspace-write", "resume", "conv-1", NUDGE],
			identity: { harness: "codex", harnessSessionId: "conv-1" },
		},
	},
	{
		harness: "pi",
		launchArgsEnd: ["--tui-mode", "regular", "PHASE_PROMPT"],
		readOnlyArgsEnd: ["--tui-mode", "regular", "PHASE_PROMPT"],
		launchIdentity: { harness: "pi" },
	},
	{
		harness: "fake",
		launchArgsEnd: ["ask", "PHASE_PROMPT"],
		readOnlyArgsEnd: ["ask", "--read-only", "PHASE_PROMPT"],
		launchIdentity: {},
		resume: {
			argsEnd: ["continue", "conv-1", NUDGE],
			identity: { harnessSessionId: "conv-1" },
		},
	},
];

const item = makeBacklogItem({ id: 42 });
const phase = { name: "Phase 1", tasks: [{ task: "do it" }] };
const mockSpawn = vi.mocked(spawnInherit);

async function runPhase(
	harness: HarnessKind,
	options: { resumeSessionId?: string; allowEdits?: boolean } = {},
) {
	const spawnOptions = { harness, ...options };
	const prepared = await preparePhaseSession(
		item,
		phase,
		0,
		1,
		2,
		"phase 1/2",
		spawnOptions,
	);
	if (!prepared) throw new Error("phase was not prepared");
	await launchPhaseSession(
		item,
		1,
		phase,
		"phase 1/2",
		prepared.claudeSessionId,
		spawnOptions,
	);
}

function spawnedArgsEnd(length: number): string[] {
	expect(mockSpawn).toHaveBeenCalledTimes(1);
	return (mockSpawn.mock.calls[0][1] as string[]).slice(-length);
}

describe.each(fixtures)("Build phase on the $harness adapter", (fixture) => {
	const harness = fixture.harness as HarnessKind;

	beforeEach(() => {
		vi.clearAllMocks();
		process.env.ASSIST_RESUME_PROMPT = NUDGE;
	});

	it("launches the phase prompt through the adapter", async () => {
		await runPhase(harness);

		expect(spawnedArgsEnd(fixture.launchArgsEnd.length)).toEqual(
			fixture.launchArgsEnd,
		);
	});

	it("honours --no-write through the adapter", async () => {
		await runPhase(harness, { allowEdits: false });

		expect(spawnedArgsEnd(fixture.readOnlyArgsEnd.length)).toEqual(
			fixture.readOnlyArgsEnd,
		);
	});

	it("reports the adapter's identity and persists the phase id as before", async () => {
		await runPhase(harness);

		expect(emitActivity).toHaveBeenCalledWith(
			expect.objectContaining({ kind: "backlog", ...fixture.launchIdentity }),
		);
		const reported = vi.mocked(emitActivity).mock.calls[0][0];
		for (const key of ["claudeSessionId", "harness", "harnessSessionId"])
			if (!(key in fixture.launchIdentity))
				expect(reported).not.toHaveProperty(key);
		expect(persistPhaseSessionId).toHaveBeenCalledWith(42, 0, "uuid-1");
	});

	it.runIf(fixture.resume)(
		"resumes the phase conversation and reports its id",
		async () => {
			await runPhase(harness, { resumeSessionId: "conv-1" });

			const resume = fixture.resume as NonNullable<Fixture["resume"]>;
			expect(spawnedArgsEnd(resume.argsEnd.length)).toEqual(resume.argsEnd);
			expect(emitActivity).toHaveBeenCalledWith(
				expect.objectContaining(resume.identity),
			);
			expect(persistPhaseSessionId).not.toHaveBeenCalled();
		},
	);
});
