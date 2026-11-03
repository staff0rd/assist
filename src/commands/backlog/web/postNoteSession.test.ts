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

vi.mock("../../sessions/web/fromGithub/launchPlannedSession", () => ({
	launchPlannedSession: vi.fn(),
}));

import { launchPlannedSession } from "../../sessions/web/fromGithub/launchPlannedSession";
import { postNoteSession } from "./postNoteSession";

const mockLaunch = launchPlannedSession as unknown as MockInstance;

function makeReqRes(body: string, url = "/api/note-session?cwd=/git/blog") {
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

describe("postNoteSession", () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockLaunch.mockResolvedValue("s-1");
	});

	it.each([
		["draft", "draft"],
		["bug", "bug"],
		["prompt", undefined],
	])(
		"starts a %s session in the repo with the dictation",
		async (mode, expected) => {
			const text = "Add a dark mode toggle to the blog header";
			const { req, res, status, json } = makeReqRes(
				JSON.stringify({ text, mode }),
			);

			await postNoteSession(req, res);

			expect(mockLaunch).toHaveBeenCalledWith({
				cwd: "/git/blog",
				prompt: text,
				mode: expected,
			});
			expect(status()).toBe(201);
			expect(json()).toEqual({ sessionId: "s-1" });
		},
	);

	it("rejects a missing cwd, blank text or unknown mode with 400", async () => {
		const cases = [
			makeReqRes(
				JSON.stringify({ text: "idea", mode: "draft" }),
				"/api/note-session",
			),
			makeReqRes(JSON.stringify({ text: "  ", mode: "draft" })),
			makeReqRes(JSON.stringify({ text: "idea", mode: "refine" })),
			makeReqRes("not json"),
		];
		for (const { req, res, status } of cases) {
			await postNoteSession(req, res);
			expect(status()).toBe(400);
		}
		expect(mockLaunch).not.toHaveBeenCalled();
	});

	it("reports a launch failure with 500", async () => {
		mockLaunch.mockRejectedValue(new Error("daemon down"));
		const { req, res, status, json } = makeReqRes(
			JSON.stringify({ text: "idea", mode: "bug" }),
		);

		await postNoteSession(req, res);

		expect(status()).toBe(500);
		expect(json()).toEqual({ error: "daemon down" });
	});
});
