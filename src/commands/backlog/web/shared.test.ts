import type { IncomingMessage, ServerResponse } from "node:http";
import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { BacklogItemSummary, BacklogStatus } from "../types";

vi.mock("../shared", () => ({
	getReady: vi.fn(),
}));

vi.mock("../loadBacklogSummaries", () => ({
	loadBacklogSummaries: vi.fn(),
	searchBacklogSummaries: vi.fn(),
}));

vi.mock("./applyCwdFromReq", () => ({
	applyCwdFromReq: vi.fn(),
}));

import {
	loadBacklogSummaries,
	searchBacklogSummaries,
} from "../loadBacklogSummaries";
import { listItems } from "./shared";

const mockLoadBacklog = loadBacklogSummaries as unknown as MockInstance;
const mockSearchBacklog = searchBacklogSummaries as unknown as MockInstance;

function makeItem(
	id: number,
	status: BacklogStatus = "todo",
	starred = false,
): BacklogItemSummary {
	return {
		id,
		type: "story",
		name: `Item ${id}`,
		status,
		starred,
		incompleteSubtasks: 0,
	};
}

function makeReqRes(url: string): {
	req: IncomingMessage;
	res: ServerResponse;
	getJson: () => BacklogItemSummary[];
} {
	const req = { url } as IncomingMessage;
	let body = "";
	const res = {
		writeHead: vi.fn(),
		end: vi.fn((chunk?: string) => {
			if (chunk) body = chunk;
		}),
	} as unknown as ServerResponse;
	return { req, res, getJson: () => JSON.parse(body) as BacklogItemSummary[] };
}

describe("listItems", () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe("when listing without a query", () => {
		it("returns items in descending-id order", async () => {
			mockLoadBacklog.mockResolvedValue([
				makeItem(1),
				makeItem(2),
				makeItem(3),
			]);
			const { req, res, getJson } = makeReqRes("/api/backlog");

			await listItems(req, res);

			expect(getJson().map((item) => item.id)).toEqual([3, 2, 1]);
			expect(mockSearchBacklog).not.toHaveBeenCalled();
		});
	});

	describe("when the filter is todo (default)", () => {
		it("lists only todo and in-progress items", async () => {
			mockLoadBacklog.mockResolvedValue([
				makeItem(1, "todo"),
				makeItem(2, "done"),
				makeItem(3, "in-progress"),
				makeItem(4, "wontdo"),
			]);
			const { req, res, getJson } = makeReqRes("/api/items");

			await listItems(req, res);

			expect(getJson().map((item) => item.id)).toEqual([3, 1]);
		});

		it("excludes completed items from search results", async () => {
			mockSearchBacklog.mockResolvedValue([
				makeItem(5, "todo"),
				makeItem(6, "done"),
			]);
			const { req, res, getJson } = makeReqRes("/api/items?q=foo");

			await listItems(req, res);

			expect(getJson().map((item) => item.id)).toEqual([5]);
		});

		it("falls back to todo when the filter param is unrecognised", async () => {
			mockLoadBacklog.mockResolvedValue([
				makeItem(1, "todo"),
				makeItem(2, "done"),
			]);
			const { req, res, getJson } = makeReqRes("/api/items?filter=bogus");

			await listItems(req, res);

			expect(getJson().map((item) => item.id)).toEqual([1]);
		});
	});

	describe("when the filter is done", () => {
		it("lists only done and wontdo items", async () => {
			mockLoadBacklog.mockResolvedValue([
				makeItem(1, "todo"),
				makeItem(2, "done"),
				makeItem(3, "in-progress"),
				makeItem(4, "wontdo"),
			]);
			const { req, res, getJson } = makeReqRes("/api/items?filter=done");

			await listItems(req, res);

			expect(getJson().map((item) => item.id)).toEqual([4, 2]);
		});

		it("keeps only completed items in search results", async () => {
			mockSearchBacklog.mockResolvedValue([
				makeItem(5, "todo"),
				makeItem(6, "done"),
			]);
			const { req, res, getJson } = makeReqRes("/api/items?q=foo&filter=done");

			await listItems(req, res);

			expect(getJson().map((item) => item.id)).toEqual([6]);
		});
	});

	describe("when the filter is all", () => {
		it("lists every item regardless of status", async () => {
			mockLoadBacklog.mockResolvedValue([
				makeItem(1, "todo"),
				makeItem(2, "done"),
				makeItem(3, "in-progress"),
				makeItem(4, "wontdo"),
			]);
			const { req, res, getJson } = makeReqRes("/api/items?filter=all");

			await listItems(req, res);

			expect(getJson().map((item) => item.id)).toEqual([4, 3, 2, 1]);
		});

		it("includes completed items in search results", async () => {
			mockSearchBacklog.mockResolvedValue([
				makeItem(5, "todo"),
				makeItem(6, "done"),
			]);
			const { req, res, getJson } = makeReqRes("/api/items?q=foo&filter=all");

			await listItems(req, res);

			expect(getJson().map((item) => item.id)).toEqual([6, 5]);
		});
	});

	describe("when searching with a query", () => {
		it("returns matching items in descending-id order", async () => {
			mockSearchBacklog.mockResolvedValue([makeItem(5), makeItem(9)]);
			const { req, res, getJson } = makeReqRes("/api/backlog?q=foo");

			await listItems(req, res);

			expect(mockSearchBacklog).toHaveBeenCalledWith("foo");
			expect(getJson().map((item) => item.id)).toEqual([9, 5]);
			expect(mockLoadBacklog).not.toHaveBeenCalled();
		});
	});
});
