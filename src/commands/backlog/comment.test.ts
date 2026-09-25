import { eq } from "drizzle-orm";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { createTestDb } from "../../shared/db/createTestDb";
import type { Db } from "../../shared/db/Db";
import { comments, items } from "../../shared/db/schema";
import { comment } from "./comment";

let orm: Db;
let close: () => Promise<void>;

const mockRequestPreviewDecision = vi.fn();
const mockLoadConfig = vi.fn();

vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

vi.mock("../../shared/db/getDb", () => ({
	getDb: () => Promise.resolve(orm),
}));

vi.mock("./ensureRemoteOrigin", () => ({
	ensureRemoteOrigin: () => true,
}));

vi.mock("../sessions/shared/requestPreviewDecision", () => ({
	requestPreviewDecision: (...args: unknown[]) =>
		mockRequestPreviewDecision(...args),
}));

vi.mock("./shared", () => ({
	getOrigin: () => "test",
	findOneItem: () => ({
		orm,
		item: { id: 1, name: "Preview items", type: "story", status: "todo" },
	}),
}));

function getComments() {
	return orm
		.select({ text: comments.text, type: comments.type })
		.from(comments)
		.where(eq(comments.itemId, 1));
}

beforeEach(async () => {
	({ orm, close } = await createTestDb());
	await orm
		.insert(items)
		.values({ id: 1, origin: "test", name: "Preview items", status: "todo" });
	mockRequestPreviewDecision.mockReset();
	mockLoadConfig.mockReset();
	mockLoadConfig.mockReturnValue({ backlog: { previewComments: true } });
	vi.spyOn(console, "log").mockImplementation(() => {});
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

afterEach(async () => {
	await close();
	vi.restoreAllMocks();
	delete process.env.ASSIST_SESSION;
	delete process.env.ASSIST_SESSION_ID;
});

describe("comment", () => {
	it("appends the comment without a preview outside a web session", async () => {
		await comment("a1", "Looks good to me");

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(await getComments()).toEqual([
			{ text: "Looks good to me", type: "comment" },
		]);
	});

	it("appends the comment without a preview when the session id is missing", async () => {
		process.env.ASSIST_SESSION = "1";

		await comment("a1", "Looks good to me");

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(await getComments()).toEqual([
			{ text: "Looks good to me", type: "comment" },
		]);
	});

	it("appends the comment without a preview when backlog.previewComments is off", async () => {
		mockLoadConfig.mockReturnValue({});
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "7";

		await comment("a1", "Looks good to me");

		expect(mockRequestPreviewDecision).not.toHaveBeenCalled();
		expect(await getComments()).toEqual([
			{ text: "Looks good to me", type: "comment" },
		]);
	});

	it("previews the comment in a web session and appends it on approval", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "7";
		mockRequestPreviewDecision.mockResolvedValue({ decision: "approve" });

		await comment("a1", "Looks good to me");

		expect(mockRequestPreviewDecision).toHaveBeenCalledWith(
			expect.objectContaining({
				sessionId: "7",
				title: "Comment on a1: Preview items",
				body: "Looks good to me",
				kind: "backlog-comment",
				prNumber: null,
			}),
		);
		expect(await getComments()).toEqual([
			{ text: "Looks good to me", type: "comment" },
		]);
	});

	it("exits non-zero without appending when the preview is rejected", async () => {
		process.env.ASSIST_SESSION = "1";
		process.env.ASSIST_SESSION_ID = "7";
		const errorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
		vi.spyOn(process, "exit").mockImplementation((() => {
			throw new Error("process.exit");
		}) as never);
		mockRequestPreviewDecision.mockResolvedValue({
			decision: "reject",
			reason: "wrong item",
			comments: [{ quote: "Looks good", note: "too vague" }],
		});

		await expect(comment("a1", "Looks good to me")).rejects.toThrow(
			"process.exit",
		);

		const output = errorSpy.mock.calls.map((c) => c.join(" ")).join("\n");
		expect(output).toContain("wrong item");
		expect(output).toContain("> Looks good");
		expect(output).toContain("too vague");
		expect(await getComments()).toEqual([]);
	});
});
