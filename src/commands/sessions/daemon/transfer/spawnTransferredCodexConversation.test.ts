import {
	mkdirSync,
	mkdtempSync,
	readFileSync,
	rmSync,
	writeFileSync,
} from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import type { Session } from "../createSession";
import type { TreeSpawnContext } from "../worktree/allocateAndBind";
import { allocateTree } from "../worktree/allocateTree";
import { readTransferTranscript } from "./readTransferTranscript";
import { restoreTransferSnapshot } from "./restoreTransferSnapshot";
import { spawnTransferredConversation } from "./spawnTransferredConversation";
import { transferLaunchRequest } from "./transferLaunchRequest";
import { parseTransferredConversation } from "../../../../shared/harnessAdapters/TransferredConversation";
import { parseTransferSnapshot } from "./TransferSnapshot";
import { transferPlan } from "../../shared/transferPlan";

const home = vi.hoisted(() => ({ root: "" }));

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../shared/codex/codexSessionsDir", () => ({
	codexSessionsDir: () => join(home.root, "sessions"),
	hasCodexSessions: () => true,
}));
vi.mock("../worktree/allocateTree", () => ({ allocateTree: vi.fn() }));
vi.mock("../worktree/seedWorktree", () => ({
	seedWorktree: vi.fn(
		(_p: string, _c: string, onSeeded: (outcome: { ok: true }) => void) =>
			onSeeded({ ok: true }),
	),
}));
vi.mock("../worktree/refuseUnallocatedStart", () => ({
	refuseUnallocatedStart: vi.fn(),
}));
vi.mock("./awaitRunEstablished", () => ({
	awaitRunEstablished: vi.fn(() =>
		Promise.resolve({ ok: true, reason: "survived startup" }),
	),
}));
vi.mock("./restoreTransferSnapshot", () => ({
	restoreTransferSnapshot: vi.fn(),
}));

const ID = "01a1c061-d950-7fc0-96f3-2dd6731803df";
const DATE = ["2026", "11", "09"];
const FILE = `rollout-2026-11-09T12-56-42-${ID}.jsonl`;
const SOURCE_CWD = "/home/dev/git/assist-3";
const ROLLOUT = [
	{
		type: "session_meta",
		payload: { id: ID, cwd: SOURCE_CWD, runtime_workspace_roots: [SOURCE_CWD] },
	},
	{ type: "turn_context", payload: { cwd: SOURCE_CWD, model: "gpt" } },
	{
		type: "response_item",
		payload: { type: "message", content: `ran in ${SOURCE_CWD}` },
	},
]
	.map((line) => JSON.stringify(line))
	.join("\n");
const snapshot = { ref: "assist/transfer/work-wsl-7" };

function context(): TreeSpawnContext {
	const sessions = new Map<string, Session>();
	return {
		sessions,
		spawnWith: vi.fn((create) => {
			sessions.set("4", create("4"));
			return "4";
		}),
		notify: vi.fn(),
		startHeld: vi.fn(),
	};
}

function writeSourceRollout() {
	const dir = join(home.root, "sessions", ...DATE);
	mkdirSync(dir, { recursive: true });
	writeFileSync(join(dir, FILE), ROLLOUT);
}

async function transfer(harness: "codex" | "codex-sdk") {
	const s = makeSession({
		id: "7",
		commandType: "claude",
		harness,
		harnessSessionId: ID,
		title: "Fix login",
	});
	const plan = transferPlan(s);
	if (!plan) throw new Error("not transferable");
	const read = await readTransferTranscript(plan);
	if (!read.ok) throw new Error(read.error);
	const d = structuredClone(
		transferLaunchRequest(s, plan, {
			target: "win",
			cwd: "C:/git/assist",
			traceId: "abcd1234",
			snapshot,
			conversation: read.conversation,
		}),
	);
	rmSync(join(home.root, "sessions"), { recursive: true, force: true });
	const conversation = parseTransferredConversation(d.conversation);
	const parsed = parseTransferSnapshot(d.transfer);
	if (!conversation || !parsed) throw new Error("unparsed transfer");
	const ctx = context();
	const id = await spawnTransferredConversation(ctx, vi.fn(), {
		cwd: d.cwd as string,
		harness: d.harness as typeof harness,
		conversation,
		snapshot: parsed,
		title: d.title as string,
	});
	return { d, session: ctx.sessions.get(id), ctx };
}

describe.each(["codex", "codex-sdk"] as const)(
	"transferred %s conversation",
	(harness) => {
		beforeEach(() => {
			vi.clearAllMocks();
			home.root = mkdtempSync(join(tmpdir(), "transfer-codex-"));
			writeSourceRollout();
			vi.mocked(restoreTransferSnapshot).mockResolvedValue();
			vi.mocked(allocateTree).mockReturnValue({
				cwd: "/git/assist-4",
				kind: "worktree",
				created: true,
				clone: "/git/assist",
				ready: Promise.resolve(),
			});
		});

		afterEach(() => rmSync(home.root, { recursive: true, force: true }));

		it("routes the rollout with its dated location", async () => {
			const { d } = await transfer(harness);
			expect(d).toMatchObject({
				type: "create",
				harness,
				conversation: { id: ID, transcript: ROLLOUT, path: [...DATE, FILE] },
			});
		});

		it("places the rollout for the restored cwd and resumes it by id", async () => {
			const { session, ctx } = await transfer(harness);
			const placed = readFileSync(
				join(home.root, "sessions", ...DATE, FILE),
				"utf8",
			)
				.split("\n")
				.map((line) => JSON.parse(line));
			expect(placed[0].payload).toMatchObject({
				cwd: "/git/assist-4",
				runtime_workspace_roots: ["/git/assist-4"],
			});
			expect(placed[1].payload.cwd).toBe("/git/assist-4");
			expect(placed[2].payload.content).toBe(`ran in ${SOURCE_CWD}`);
			expect(session).toMatchObject({
				harness,
				harnessSessionId: ID,
				cwd: "/git/assist-4",
				title: "Fix login",
			});
			expect(ctx.startHeld).toHaveBeenCalledTimes(1);
		});
	},
);
