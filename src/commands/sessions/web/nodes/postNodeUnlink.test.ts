import type { IncomingMessage, ServerResponse } from "node:http";
import { Readable } from "node:stream";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ReloadLinksResult } from "../../nodes/reloadDaemonLinks";

const readLinks = vi.fn();
const writeLinks = vi.fn();
const reloadDaemonLinks = vi.fn<() => Promise<ReloadLinksResult>>();

vi.mock("../../nodes/readLinks", () => ({ readLinks: () => readLinks() }));
vi.mock("../../nodes/writeLinks", () => ({
	writeLinks: (links: unknown) => writeLinks(links),
}));
vi.mock("../../nodes/reloadDaemonLinks", () => ({
	reloadDaemonLinks: () => reloadDaemonLinks(),
}));

import { postNodeUnlink } from "./postNodeUnlink";

function request(body: string): IncomingMessage {
	return Readable.from([Buffer.from(body)]) as unknown as IncomingMessage;
}

function response() {
	const sent: { status?: number; body?: unknown } = {};
	const res = {
		writeHead: (status: number) => {
			sent.status = status;
		},
		end: (body: string) => {
			sent.body = JSON.parse(body);
		},
	} as unknown as ServerResponse;
	return { res, sent };
}

const win = { name: "win", url: "http://win:3100" };
const mac = { name: "mac", url: "http://mac:3100" };

beforeEach(() => {
	vi.spyOn(console, "log").mockImplementation(() => {});
	readLinks.mockReset().mockResolvedValue([win, mac]);
	writeLinks.mockReset().mockResolvedValue(undefined);
	reloadDaemonLinks.mockReset().mockResolvedValue({ kind: "reloaded" });
});

describe("postNodeUnlink", () => {
	it("writes the links without the node and reloads the daemon's links", async () => {
		const { res, sent } = response();
		await postNodeUnlink(request(JSON.stringify({ name: "win" })), res);
		expect(writeLinks).toHaveBeenCalledWith([mac]);
		expect(reloadDaemonLinks).toHaveBeenCalled();
		expect(sent).toEqual({
			status: 200,
			body: { ok: true, daemon: { kind: "reloaded" } },
		});
	});

	it("still writes the links and reports when the daemon is not running", async () => {
		reloadDaemonLinks.mockResolvedValue({ kind: "not-running" });
		const { res, sent } = response();
		await postNodeUnlink(request(JSON.stringify({ name: "win" })), res);
		expect(writeLinks).toHaveBeenCalledWith([mac]);
		expect(sent.body).toEqual({ ok: true, daemon: { kind: "not-running" } });
	});

	it("refuses an unknown node without writing", async () => {
		const { res, sent } = response();
		await postNodeUnlink(request(JSON.stringify({ name: "nope" })), res);
		expect(writeLinks).not.toHaveBeenCalled();
		expect(reloadDaemonLinks).not.toHaveBeenCalled();
		expect(sent).toEqual({
			status: 404,
			body: { error: "No link named nope" },
		});
	});

	it("refuses a body without a name", async () => {
		const { res, sent } = response();
		await postNodeUnlink(request("not json"), res);
		expect(sent.status).toBe(400);
		expect(readLinks).not.toHaveBeenCalled();
	});
});
