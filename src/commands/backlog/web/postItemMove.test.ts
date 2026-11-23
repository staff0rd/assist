import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import {
	beforeEach,
	describe,
	expect,
	it,
	type MockInstance,
	vi,
} from "vitest";

vi.mock("../reorderItem", () => ({ reorderItem: vi.fn() }));
vi.mock("../shared", () => ({
	getReady: vi.fn(async () => ({ orm: "orm" })),
}));

import { reorderItem } from "../reorderItem";
import { postItemMove } from "./postItemMove";

const mockReorder = reorderItem as unknown as MockInstance;

function makeReqRes(body: unknown) {
	const req = Readable.from([
		Buffer.from(JSON.stringify(body)),
	]) as unknown as IncomingMessage;
	const writeHead = vi.fn();
	let sent = "";
	const res = {
		writeHead,
		end: vi.fn((chunk?: string) => {
			if (chunk) sent = chunk;
		}),
	} as unknown as ServerResponse;
	return {
		req,
		res,
		status: () => writeHead.mock.calls[0][0] as number,
		json: () => JSON.parse(sent) as Record<string, unknown>,
	};
}

describe("postItemMove", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockReorder.mockResolvedValue(undefined);
	});

	it.each([
		{ edge: "top" },
		{ edge: "bottom" },
		{ side: "before", targetId: 3 },
		{ side: "after", targetId: 3 },
	])("moves the item to %o", async (placement) => {
		const { req, res, status } = makeReqRes(placement);

		await postItemMove(req, res, 7);

		expect(mockReorder).toHaveBeenCalledWith("orm", 7, placement);
		expect(status()).toBe(200);
	});

	it("rejects an invalid placement without moving", async () => {
		const { req, res, status } = makeReqRes({ edge: "middle" });

		await postItemMove(req, res, 7);

		expect(mockReorder).not.toHaveBeenCalled();
		expect(status()).toBe(400);
	});

	it("returns the reorder error as a 400", async () => {
		mockReorder.mockResolvedValue("a3 belongs to other, not mine");
		const { req, res, status, json } = makeReqRes({
			side: "before",
			targetId: 3,
		});

		await postItemMove(req, res, 7);

		expect(status()).toBe(400);
		expect(json().error).toBe("a3 belongs to other, not mine");
	});
});
