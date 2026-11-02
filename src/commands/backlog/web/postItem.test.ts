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

vi.mock("../createItemWithDefaults", () => ({
	createItemWithDefaults: vi.fn(),
}));

vi.mock("./applyCwdFromReq", () => ({
	applyCwdFromReq: vi.fn(),
}));

import { createItemWithDefaults } from "../createItemWithDefaults";
import { applyCwdFromReq } from "./applyCwdFromReq";
import { postItem } from "./postItem";

const mockCreate = createItemWithDefaults as unknown as MockInstance;

function makeReqRes(body: string) {
	const req = Object.assign(Readable.from([Buffer.from(body)]), {
		url: "/api/items?cwd=/repo",
	}) as unknown as IncomingMessage;
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

describe("postItem", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockCreate.mockResolvedValue(42);
	});

	it("creates a story named from the first words with the full text as description", async () => {
		const text =
			"Add a toggle to the sessions page that hides archived sessions by default.";
		const { req, res, status, json } = makeReqRes(JSON.stringify({ text }));

		await postItem(req, res);

		expect(applyCwdFromReq).toHaveBeenCalledWith(req);
		expect(mockCreate).toHaveBeenCalledWith({
			type: "story",
			name: "Add a toggle to the sessions page that",
			description: text,
			acceptanceCriteria: [],
		});
		expect(status()).toBe(201);
		expect(json()).toEqual({
			id: "a42",
			name: "Add a toggle to the sessions page that",
		});
	});

	it("rejects a missing or blank text with 400", async () => {
		for (const body of ["{}", JSON.stringify({ text: "   " }), "not json"]) {
			const { req, res, status } = makeReqRes(body);

			await postItem(req, res);

			expect(status()).toBe(400);
		}
		expect(mockCreate).not.toHaveBeenCalled();
	});
});
