import { existsSync, mkdtempSync } from "node:fs";
import { createServer, type Server } from "node:http";
import type { AddressInfo } from "node:net";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type {
	PreviewDecision,
	PreviewReviewComment,
} from "../../../sessions/shared/PreviewDecision";
import type { PreviewRequest } from "../../../sessions/shared/requestPreviewDecision";
import { getHighLevelProgress } from "../../../sessions/web/highLevelProgress/getHighLevelProgress";
import { postHighLevelProgress } from "../../../sessions/web/highLevelProgress/postHighLevelProgress";
import type { HighLevelOverlaySubject } from "../HighLevelOverlaySubject";
import { highLevelReviewPath } from "../highLevelReviewPath";
import { loadReopenedReview } from "../loadReopenedReview";
import { openHighLevelOverlay } from "../openHighLevelOverlay";
import type { HighLevelReviewDraft } from "../types";
import { writeJsonFile } from "../writeJsonFile";
import { highLevelProgressApiPath } from "./highLevelProgressApiPath";
import { highLevelProgressPath } from "./highLevelProgressPath";
import type { HighLevelPaneProgress } from "./StoredHighLevelProgress";

const mockAwaitPreviewApproval =
	vi.fn<(request: PreviewRequest) => Promise<PreviewDecision>>();
const mockSubmitHighLevelReview = vi.fn();

vi.mock("../../../sessions/shared/awaitPreviewApproval", () => ({
	awaitPreviewApproval: (_subject: string, request: PreviewRequest) =>
		mockAwaitPreviewApproval(request),
}));

vi.mock("../submitHighLevelReview", () => ({
	submitHighLevelReview: (...args: unknown[]) =>
		mockSubmitHighLevelReview(...args),
}));

const REPO = "org/repo";
const PR = 42;
const HEAD = "abc1234";
const MOVED_HEAD = "def5678";

const lineComment: PreviewReviewComment = {
	path: "src/a.ts",
	startLine: 4,
	endLine: 4,
	quote: "const a = 1;",
	note: "rename this",
};

const paneProgress: HighLevelPaneProgress = {
	items: [{ id: "structure-sensible", ticked: true, comment: "split it" }],
	reviewComments: [lineComment],
};

function subject(headSha = HEAD): HighLevelOverlaySubject {
	return {
		repo: REPO,
		prNumber: PR,
		title: "A change",
		headRef: "feat/thing",
		headSha,
		body: "",
		checks: [
			{
				id: "structure-sensible",
				kind: "manual",
				title: "Structure",
				short: "Structure",
				backing: "tree",
				status: "manual",
				reason: "tree",
			},
		],
		structure: {
			tree: [],
			added: 0,
			removed: 0,
			modified: 0,
			additions: 0,
			deletions: 0,
		},
		criticalDiffs: [],
		criticalPaths: [],
		tests: [],
		testPaths: [],
		collapsedPaths: [],
	};
}

const servers: Server[] = [];

async function startWebServer(): Promise<string> {
	const server = createServer((req, res) => {
		const path = new URL(req.url ?? "/", "http://localhost").pathname;
		if (path !== highLevelProgressApiPath) res.writeHead(404).end();
		else if (req.method === "POST") void postHighLevelProgress(req, res);
		else getHighLevelProgress(req, res);
	});
	servers.push(server);
	await new Promise<void>((resolve) => server.listen(0, resolve));
	return `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
}

async function stopWebServers(): Promise<void> {
	await Promise.all(
		servers
			.splice(0)
			.map(
				(server) =>
					new Promise<void>((resolve) => server.close(() => resolve())),
			),
	);
}

async function paneWrites(
	base: string,
	progress: HighLevelPaneProgress,
	requestId = "req-1",
): Promise<number> {
	const res = await fetch(`${base}${highLevelProgressApiPath}`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({
			repo: REPO,
			prNumber: PR,
			headSha: HEAD,
			requestId,
			...progress,
		}),
	});
	return res.status;
}

async function paneReads(
	base: string,
	headSha: string,
): Promise<HighLevelPaneProgress | undefined> {
	const params = new URLSearchParams({
		repo: REPO,
		prNumber: String(PR),
		headSha,
	});
	const res = await fetch(`${base}${highLevelProgressApiPath}?${params}`);
	const body = (await res.json()) as { progress: HighLevelPaneProgress | null };
	return body.progress ?? undefined;
}

function cliOpens(headSha: string, force: boolean) {
	return loadReopenedReview(
		{ repo: REPO, prNumber: PR, headRef: "feat/thing", headSha },
		force,
	).progress;
}

type Reopen = (base: string) => Promise<HighLevelPaneProgress | undefined>;

const reopenPaths: [string, Reopen, { headMoved?: boolean }?][] = [
	["browser refresh", (base) => paneReads(base, HEAD)],
	[
		"web server restart",
		async () => {
			await stopWebServers();
			return paneReads(await startWebServer(), HEAD);
		},
	],
	[
		"daemon restart re-delivering the preview",
		async () => cliOpens(HEAD, false),
	],
	["CLI killed mid-review, then rerun", async () => cliOpens(HEAD, false)],
	[
		"Close then Reopen",
		async () => {
			mockAwaitPreviewApproval.mockResolvedValueOnce({
				decision: "reject",
				dismissed: true,
				checklist: [
					{ id: "structure-sensible", ticked: true, comment: "split it" },
				],
				reviewComments: [{ ...lineComment, headSha: HEAD }],
			});
			await openHighLevelOverlay("s1", subject());
			return cliOpens(HEAD, false);
		},
	],
	["--force re-run", async () => cliOpens(HEAD, true)],
	[
		"PR head moved",
		async () => cliOpens(MOVED_HEAD, true),
		{ headMoved: true },
	],
	[
		"another browser or the iOS app",
		async () => paneReads(await startWebServer(), HEAD),
	],
];

const originalStore = process.env.ASSIST_STORE_DIR;
let log: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
	process.env.ASSIST_STORE_DIR = mkdtempSync(join(tmpdir(), "hl-survival-"));
	mockAwaitPreviewApproval.mockReset();
	mockSubmitHighLevelReview.mockReset();
	log = vi.spyOn(console, "log").mockImplementation(() => {});
});

afterEach(async () => {
	log.mockRestore();
	await stopWebServers();
	if (originalStore === undefined) delete process.env.ASSIST_STORE_DIR;
	else process.env.ASSIST_STORE_DIR = originalStore;
});

describe("high-level review progress survives every reopen path", () => {
	it.each(reopenPaths)("%s", async (_, reopen, { headMoved } = {}) => {
		const base = await startWebServer();
		expect(await paneWrites(base, paneProgress)).toBe(200);

		const reopened = await reopen(base);

		expect(reopened?.reviewComments).toEqual([
			{ ...lineComment, headSha: HEAD },
		]);
		expect(reopened?.items).toEqual([
			headMoved
				? { id: "structure-sensible", comment: "split it" }
				: { id: "structure-sensible", ticked: true, comment: "split it" },
		]);
	});
});

describe("clearing high-level review progress", () => {
	async function decide(decision: PreviewDecision, onRestart = async () => {}) {
		const base = await startWebServer();
		await paneWrites(base, paneProgress);
		mockAwaitPreviewApproval.mockResolvedValueOnce(decision);
		await openHighLevelOverlay("s1", subject(), onRestart);
		const request = mockAwaitPreviewApproval.mock.calls[0]?.[0];
		return { base, requestId: request?.requestId ?? "" };
	}

	it("posts carried-over comments with the verdict, clears, and refuses that review's late write", async () => {
		const { base, requestId } = await decide({
			decision: "approve",
			reviewEvent: "COMMENT",
			checklist: [],
			reviewComments: [{ ...lineComment, headSha: HEAD }],
		});

		expect(mockSubmitHighLevelReview).toHaveBeenCalledWith(
			expect.objectContaining({
				reviewComments: [expect.objectContaining(lineComment)],
			}),
		);
		expect(cliOpens(HEAD, true)).toBeUndefined();
		expect(await paneWrites(base, paneProgress, requestId)).toBe(409);
		expect(cliOpens(HEAD, true)).toBeUndefined();
	});

	it("clears on Start fresh", async () => {
		const onRestart = vi.fn(async () => {});

		await decide(
			{ decision: "reject", dismissed: true, restart: true },
			onRestart,
		);

		expect(onRestart).toHaveBeenCalledOnce();
		expect(cliOpens(HEAD, true)).toBeUndefined();
	});

	it("keeps progress when a dismissal carries no checklist", async () => {
		await decide({ decision: "reject", dismissed: true });

		expect(cliOpens(HEAD, false)?.reviewComments).toHaveLength(1);
	});
});

describe("migrating per-head drafts", () => {
	const draftPath = (sha: string) =>
		highLevelReviewPath(REPO, "feat/thing", sha).replace(
			/\.json$/,
			".draft.json",
		);

	const draft = (
		sha: string,
		savedAt: string,
		note: string,
	): HighLevelReviewDraft => ({
		repo: REPO,
		prNumber: PR,
		headRef: "feat/thing",
		headSha: sha,
		savedAt,
		items: [],
		reviewComments: [{ ...lineComment, note }],
	});

	it("restores every draft's comments at a later head and removes the drafts", () => {
		writeJsonFile(
			draftPath("0ld0000"),
			draft("0ld0000", "2026-11-01T00:00:00Z", "old"),
		);
		writeJsonFile(
			draftPath(HEAD),
			draft(HEAD, "2026-11-17T00:00:00Z", "newest"),
		);

		const reopened = cliOpens(MOVED_HEAD, true);

		expect(reopened?.reviewComments).toEqual([
			{ ...lineComment, note: "newest", headSha: HEAD },
			{ ...lineComment, note: "old", headSha: "0ld0000" },
		]);
		expect(existsSync(draftPath(HEAD))).toBe(false);
		expect(existsSync(draftPath("0ld0000"))).toBe(false);
	});

	it("keeps an older draft's comments when a newer draft at a moved head has none", () => {
		writeJsonFile(draftPath(HEAD), {
			...draft(HEAD, "2026-11-17T00:06:00Z", "keep me"),
			items: [{ id: "structure-sensible", ticked: true, comment: "split it" }],
		});
		writeJsonFile(draftPath(MOVED_HEAD), {
			...draft(MOVED_HEAD, "2026-11-17T01:42:00Z", "unused"),
			items: [{ id: "structure-sensible", ticked: true }],
			reviewComments: [],
		});

		const reopened = cliOpens(MOVED_HEAD, true);

		expect(reopened?.reviewComments).toEqual([
			{ ...lineComment, note: "keep me", headSha: HEAD },
		]);
		expect(reopened?.items).toEqual([
			{ id: "structure-sensible", ticked: true, comment: "split it" },
		]);
	});

	it("merges drafts into progress already in the store", () => {
		const base = { ...lineComment, note: "stored", headSha: MOVED_HEAD };
		writeJsonFile(highLevelProgressPath(REPO, PR), {
			repo: REPO,
			prNumber: PR,
			updatedAt: "2026-11-17T02:00:00Z",
			items: [],
			reviewComments: [base],
		});
		writeJsonFile(
			draftPath(HEAD),
			draft(HEAD, "2026-11-17T00:00:00Z", "from draft"),
		);

		expect(cliOpens(MOVED_HEAD, true)?.reviewComments).toEqual([
			base,
			{ ...lineComment, note: "from draft", headSha: HEAD },
		]);
	});
});
