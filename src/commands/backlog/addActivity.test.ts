import { eq } from "drizzle-orm";
import {
	afterEach,
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { itemGitRefs, items } from "../../shared/db/schema";

vi.mock("./shared", () => ({
	findOneItem: vi.fn(),
}));

vi.mock("../sessions/shared/resolveSessionTranscript", () => ({
	resolveSessionTranscript: vi.fn(),
}));

import { resolveSessionTranscript } from "../sessions/shared/resolveSessionTranscript";
import { addActivity } from "./addActivity";
import { findOneItem } from "./shared";

const mockFindOneItem = findOneItem as unknown as MockInstance;
const mockResolve = resolveSessionTranscript as unknown as MockInstance;

const SESSION_ID = "991a1fde-669f-43f0-9b30-60892465b411";

let orm: Db;
let close: () => Promise<void>;
let logSpy: MockInstance;

function getRefs(orm: Db) {
	return orm
		.select({
			kind: itemGitRefs.kind,
			ref: itemGitRefs.ref,
			title: itemGitRefs.title,
			url: itemGitRefs.url,
		})
		.from(itemGitRefs)
		.where(eq(itemGitRefs.itemId, 1));
}

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	await orm.insert(items).values({
		id: 1,
		origin: "test",
		name: "Test",
		status: "in-progress",
	});
	logSpy = vi.spyOn(console, "log").mockImplementation(() => undefined);
	process.exitCode = undefined;
	mockFindOneItem.mockImplementation(async () => ({ orm, item: { id: 1 } }));
	mockResolve.mockReturnValue(undefined);
});

afterEach(async () => {
	await close();
	logSpy.mockRestore();
	mockFindOneItem.mockReset();
	mockResolve.mockReset();
	process.exitCode = undefined;
});

describe("addActivity", () => {
	it("fills a session title and transcript path from the transcript", async () => {
		mockResolve.mockReturnValue({
			path: `/home/dev/.claude/projects/-home-dev-other/${SESSION_ID}.jsonl`,
			prompt: "Fix the flaky test",
		});

		await addActivity("1", "session", SESSION_ID, {});

		expect(mockResolve).toHaveBeenCalledWith(SESSION_ID);
		expect(await getRefs(orm)).toEqual([
			{
				kind: "session",
				ref: SESSION_ID,
				title: "Fix the flaky test",
				url: `/home/dev/.claude/projects/-home-dev-other/${SESSION_ID}.jsonl`,
			},
		]);
	});

	it("attaches a session with no transcript on disk", async () => {
		await addActivity("1", "session", SESSION_ID, {});

		expect(process.exitCode).toBeUndefined();
		expect(await getRefs(orm)).toEqual([
			{ kind: "session", ref: SESSION_ID, title: null, url: null },
		]);
	});

	it("prefers an explicit title over the resolved prompt", async () => {
		mockResolve.mockReturnValue({
			path: "/transcripts/session.jsonl",
			prompt: "Fix the flaky test",
		});

		await addActivity("1", "session", SESSION_ID, { title: "Review agent" });

		expect(await getRefs(orm)).toEqual([
			{
				kind: "session",
				ref: SESSION_ID,
				title: "Review agent",
				url: "/transcripts/session.jsonl",
			},
		]);
	});

	it("does not resolve a transcript for non-session kinds", async () => {
		await addActivity("1", "pr", "42", { title: "Some PR" });

		expect(mockResolve).not.toHaveBeenCalled();
	});

	it("refuses a docs-unlock ref, which only a confirmed pin may record", async () => {
		await addActivity("1", "docs-unlock", "approved", {});

		expect(process.exitCode).toBe(1);
		expect(await getRefs(orm)).toEqual([]);
	});
});
