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

import { jsonExchange } from "./jsonExchange";
import { postNodeUnlink } from "./postNodeUnlink";

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
		const { req, res, sent } = jsonExchange({ name: "win" });
		await postNodeUnlink(req, res);
		expect(writeLinks).toHaveBeenCalledWith([mac]);
		expect(reloadDaemonLinks).toHaveBeenCalled();
		expect(sent).toEqual({
			status: 200,
			body: { ok: true, daemon: { kind: "reloaded" } },
		});
	});

	it("still writes the links and reports when the daemon is not running", async () => {
		reloadDaemonLinks.mockResolvedValue({ kind: "not-running" });
		const { req, res, sent } = jsonExchange({ name: "win" });
		await postNodeUnlink(req, res);
		expect(writeLinks).toHaveBeenCalledWith([mac]);
		expect(sent.body).toEqual({ ok: true, daemon: { kind: "not-running" } });
	});

	it("refuses an unknown node without writing", async () => {
		const { req, res, sent } = jsonExchange({ name: "nope" });
		await postNodeUnlink(req, res);
		expect(writeLinks).not.toHaveBeenCalled();
		expect(reloadDaemonLinks).not.toHaveBeenCalled();
		expect(sent).toEqual({
			status: 404,
			body: { error: "No link named nope" },
		});
	});

	it("refuses a body without a name", async () => {
		const { req, res, sent } = jsonExchange("not json");
		await postNodeUnlink(req, res);
		expect(sent.status).toBe(400);
		expect(readLinks).not.toHaveBeenCalled();
	});
});
