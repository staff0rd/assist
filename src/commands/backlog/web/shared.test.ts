import type { IncomingMessage, ServerResponse } from "node:http";
import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";
import type { BacklogFile, BacklogItem } from "../types";

vi.mock("../shared", () => ({
	getReady: vi.fn(),
	loadBacklog: vi.fn(),
	searchBacklog: vi.fn(),
}));

vi.mock("./applyCwdFromReq", () => ({
	applyCwdFromReq: vi.fn(),
}));

import { loadBacklog, searchBacklog } from "../shared";
import { listItems } from "./shared";

const mockLoadBacklog = loadBacklog as unknown as MockInstance;
const mockSearchBacklog = searchBacklog as unknown as MockInstance;

function makeItem(id: number): BacklogItem {
	return {
		id,
		type: "story",
		name: `Item ${id}`,
		acceptanceCriteria: ["AC1"],
		status: "todo",
	};
}

function makeReqRes(url: string): {
	req: IncomingMessage;
	res: ServerResponse;
	getJson: () => BacklogFile;
} {
	const req = { url } as IncomingMessage;
	let body = "";
	const res = {
		writeHead: vi.fn(),
		end: vi.fn((chunk?: string) => {
			if (chunk) body = chunk;
		}),
	} as unknown as ServerResponse;
	return { req, res, getJson: () => JSON.parse(body) as BacklogFile };
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
