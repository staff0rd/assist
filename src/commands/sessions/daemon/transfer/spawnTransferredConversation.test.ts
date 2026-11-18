import { mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { makeSession } from "../../../../test/mothers/makeSession";
import { findSessionJsonlPath } from "../../shared/findSessionJsonlPath";
import { projectDirForCwd } from "../../shared/findTranscriptPathSync";
import type { Session } from "../createSession";
import type { TreeSpawnContext } from "../worktree/allocateAndBind";
import { allocateTree } from "../worktree/allocateTree";
import { readTransferTranscript } from "./readTransferTranscript";
import { restoreTransferSnapshot } from "./restoreTransferSnapshot";
import { spawnTransferredConversation } from "./spawnTransferredConversation";
import { transferLaunchRequest } from "./transferLaunchRequest";
import { parseTransferredConversation } from "../../../../shared/harnessAdapters/TransferredConversation";
import { parseTransferSnapshot } from "./TransferSnapshot";

const home = vi.hoisted(() => ({ root: "" }));

vi.mock("../daemonLog", () => ({ daemonLog: vi.fn() }));
vi.mock("../../shared/claudeProjectsRoot", () => ({
	claudeProjectsRoot: () => home.root,
	projectSlug: (cwd: string) => cwd.replace(/[^a-zA-Z0-9]/g, "-"),
}));
vi.mock("../../shared/findSessionJsonlPath", () => ({
	findSessionJsonlPath: vi.fn(),
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

const TRANSCRIPT = '{"type":"user","sessionId":"c-1"}\n{"type":"assistant"}\n';
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

async function routedRequest(): Promise<Record<string, unknown>> {
	const source = join(home.root, "source.jsonl");
	writeFileSync(source, TRANSCRIPT);
	vi.mocked(findSessionJsonlPath).mockResolvedValue(source);
	const plan = {
		kind: "prompt",
		conversationId: "c-1",
		harness: "claude",
	} as const;
	const read = await readTransferTranscript(plan);
	if (!read.ok) throw new Error(read.error);
	const s = makeSession({ id: "7", title: "Fix login", subtitle: "auth" });
	const request = transferLaunchRequest(s, plan, {
		target: "win",
		cwd: "C:/git/assist",
		traceId: "abcd1234",
		snapshot,
		conversation: read.conversation,
	});
	return structuredClone(request);
}

describe("transferred prompt conversation", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		home.root = mkdtempSync(join(tmpdir(), "transfer-convo-"));
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

	it("routes a create carrying the transcript and conversation id", async () => {
		expect(await routedRequest()).toMatchObject({
			type: "create",
			harness: "claude",
			node: "win",
			cwd: "C:/git/assist",
			title: "Fix login",
			subtitle: "auth",
			transfer: snapshot,
			conversation: { id: "c-1", transcript: TRANSCRIPT },
		});
	});

	it("places the transcript for the restored cwd and resumes it with the title", async () => {
		const d = await routedRequest();
		const conversation = parseTransferredConversation(d.conversation);
		const parsed = parseTransferSnapshot(d.transfer);
		if (!conversation || !parsed) throw new Error("unparsed transfer");
		const ctx = context();
		const id = await spawnTransferredConversation(ctx, vi.fn(), {
			cwd: d.cwd as string,
			harness: "claude",
			conversation,
			snapshot: parsed,
			title: d.title as string,
			subtitle: d.subtitle as string,
		});
		expect(restoreTransferSnapshot).toHaveBeenCalledWith(
			"/git/assist-4",
			snapshot,
		);
		const placed = join(projectDirForCwd("/git/assist-4"), "c-1.jsonl");
		expect(readFileSync(placed, "utf8")).toBe(TRANSCRIPT);
		expect(ctx.sessions.get(id)).toMatchObject({
			claudeSessionId: "c-1",
			harness: "claude",
			cwd: "/git/assist-4",
			title: "Fix login",
			subtitle: "auth",
		});
		expect(ctx.startHeld).toHaveBeenCalledTimes(1);
	});

	it("resumes a Claude (SDK) conversation as a driven session", async () => {
		const d = await routedRequest();
		const conversation = parseTransferredConversation(d.conversation);
		if (!conversation) throw new Error("unparsed transfer");
		const ctx = context();
		const id = await spawnTransferredConversation(ctx, vi.fn(), {
			cwd: d.cwd as string,
			harness: "claude-sdk",
			conversation,
			snapshot,
		});
		const placed = join(projectDirForCwd("/git/assist-4"), "c-1.jsonl");
		expect(readFileSync(placed, "utf8")).toBe(TRANSCRIPT);
		expect(ctx.sessions.get(id)).toMatchObject({
			claudeSessionId: "c-1",
			harness: "claude-sdk",
			drivenStart: true,
		});
	});

	it("reports transcript delivery failure when the source transcript is missing", async () => {
		vi.mocked(findSessionJsonlPath).mockResolvedValue(null);
		await expect(
			readTransferTranscript({
				kind: "prompt",
				conversationId: "c-9",
				harness: "claude",
			}),
		).resolves.toEqual({
			ok: false,
			error: "transcript delivery failed: no transcript found for c-9",
		});
	});
});
