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

vi.mock("../../sessions/shared/requestAssistSession", () => ({
	requestAssistSession: vi.fn(),
}));

import { requestAssistSession } from "../../sessions/shared/requestAssistSession";
import { postNoteDraft } from "./postNoteDraft";

const mockLaunch = requestAssistSession as unknown as MockInstance;

function makeReqRes(body: string, url = "/api/note-draft?cwd=/git/blog") {
	const req = Object.assign(Readable.from([Buffer.from(body)]), {
		url,
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

describe("postNoteDraft", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLaunch.mockResolvedValue("s-1");
	});

	it("starts a one-shot /draft session in the repo with the dictation", async () => {
		const text = "Add a dark mode toggle to the blog header";
		const { req, res, status, json } = makeReqRes(JSON.stringify({ text }));

		await postNoteDraft(req, res);

		expect(mockLaunch).toHaveBeenCalledWith(
			["draft", "--once", text],
			"/git/blog",
		);
		expect(status()).toBe(201);
		expect(json()).toEqual({ sessionId: "s-1" });
	});

	it("rejects a missing cwd or blank text with 400", async () => {
		const cases = [
			makeReqRes(JSON.stringify({ text: "idea" }), "/api/note-draft"),
			makeReqRes(JSON.stringify({ text: "  " })),
			makeReqRes("not json"),
		];
		for (const { req, res, status } of cases) {
			await postNoteDraft(req, res);
			expect(status()).toBe(400);
		}
		expect(mockLaunch).not.toHaveBeenCalled();
	});

	it("reports a launch failure with 500", async () => {
		mockLaunch.mockRejectedValue(new Error("daemon down"));
		const { req, res, status, json } = makeReqRes(
			JSON.stringify({ text: "idea" }),
		);

		await postNoteDraft(req, res);

		expect(status()).toBe(500);
		expect(json()).toEqual({ error: "daemon down" });
	});
});
