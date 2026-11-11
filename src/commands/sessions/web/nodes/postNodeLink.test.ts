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
vi.mock("../../shared/resolveNodeName", () => ({
	resolveNodeName: () => "mac",
}));

import { jsonExchange } from "./jsonExchange";
import { postNodeLink } from "./postNodeLink";

const win = { name: "win", url: "http://win:3100" };

async function link(body: unknown) {
	const { req, res, sent } = jsonExchange(body);
	await postNodeLink(req, res);
	return sent;
}

beforeEach(() => {
	vi.spyOn(console, "log").mockImplementation(() => {});
	readLinks.mockReset().mockResolvedValue([win]);
	writeLinks.mockReset().mockResolvedValue(undefined);
	reloadDaemonLinks.mockReset().mockResolvedValue({ kind: "reloaded" });
});

describe("postNodeLink", () => {
	it("appends the link and reloads the daemon's links", async () => {
		const sent = await link({ name: "linux", url: "https://linux:3100/x" });
		expect(writeLinks).toHaveBeenCalledWith([
			win,
			{ name: "linux", url: "https://linux:3100" },
		]);
		expect(reloadDaemonLinks).toHaveBeenCalled();
		expect(sent).toEqual({
			status: 200,
			body: { ok: true, daemon: { kind: "reloaded" } },
		});
	});

	it("still writes the link when the daemon is not running", async () => {
		reloadDaemonLinks.mockResolvedValue({ kind: "not-running" });
		const sent = await link({ name: "linux", url: "https://linux:3100" });
		expect(writeLinks).toHaveBeenCalled();
		expect(sent.body).toEqual({ ok: true, daemon: { kind: "not-running" } });
	});

	it.each([
		[
			{ name: "win", url: "http://elsewhere:3100" },
			"win is already linked at http://win:3100",
		],
		[
			{ name: "mac", url: "http://mac:3100" },
			"mac is this node; enter another machine's URL",
		],
	])("refuses %o without writing", async (body, error) => {
		const sent = await link(body);
		expect(sent).toEqual({ status: 409, body: { error } });
		expect(writeLinks).not.toHaveBeenCalled();
		expect(reloadDaemonLinks).not.toHaveBeenCalled();
	});

	it("refuses a missing name or bad url", async () => {
		expect((await link({ url: "http://x:1" })).status).toBe(400);
		expect((await link({ name: "x", url: "nope" })).status).toBe(400);
		expect(writeLinks).not.toHaveBeenCalled();
	});
});
