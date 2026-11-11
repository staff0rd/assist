import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { PROTOCOL_VERSION } from "../../daemon/buildHello";

const readLinks = vi.fn();
const fetchMock = vi.fn();
let health: () => Promise<Response>;

vi.mock("../../nodes/readLinks", () => ({ readLinks: () => readLinks() }));
vi.mock("../../shared/resolveNodeName", () => ({
	resolveNodeName: () => "mac",
}));

import { jsonExchange } from "./jsonExchange";
import { postNodeProbe } from "./postNodeProbe";

function reply(body: unknown) {
	health = async () => Response.json(body);
}

async function probe(body: unknown) {
	const { req, res, sent } = jsonExchange(body);
	await postNodeProbe(req, res);
	return sent;
}

beforeEach(() => {
	readLinks
		.mockReset()
		.mockResolvedValue([{ name: "win", url: "http://win:3100" }]);
	reply({
		nodeName: "pc-linux",
		version: "0.1126.0",
		protocol: PROTOCOL_VERSION,
	});
	fetchMock.mockReset().mockImplementation(() => health());
	vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
	vi.unstubAllGlobals();
});

describe("postNodeProbe", () => {
	it("returns the peer's node name and version from its /api/health", async () => {
		const sent = await probe({ url: "https://pc-linux.ts.net:3100/" });
		expect(String(fetchMock.mock.calls[0][0])).toBe(
			"https://pc-linux.ts.net:3100/api/health",
		);
		expect(sent).toEqual({
			status: 200,
			body: {
				name: "pc-linux",
				version: "0.1126.0",
				url: "https://pc-linux.ts.net:3100",
			},
		});
	});

	it("refuses an unreachable peer", async () => {
		health = () =>
			Promise.reject(
				Object.assign(new Error("fetch failed"), {
					cause: new Error("connect ECONNREFUSED"),
				}),
			);
		const sent = await probe({ url: "http://nope:3100" });
		expect(sent).toEqual({
			status: 422,
			body: {
				error:
					"Could not reach http://nope:3100: fetch failed: connect ECONNREFUSED",
			},
		});
	});

	it("refuses this node", async () => {
		reply({ nodeName: "mac", protocol: PROTOCOL_VERSION });
		const sent = await probe({ url: "http://localhost:3100" });
		expect(sent.body).toEqual({
			error: "mac is this node; enter another machine's URL",
		});
	});

	it("refuses an already linked node", async () => {
		reply({ nodeName: "win", protocol: PROTOCOL_VERSION });
		const sent = await probe({ url: "http://other:3100" });
		expect(sent.body).toEqual({
			error: "win is already linked at http://win:3100",
		});
	});

	it("refuses a peer on an older link protocol", async () => {
		reply({
			nodeName: "old",
			version: "0.1000.0",
			protocol: PROTOCOL_VERSION - 1,
		});
		const sent = await probe({ url: "http://old:3100" });
		expect(sent.status).toBe(422);
		expect((sent.body as { error: string }).error).toMatch(
			/^old runs an older link protocol/,
		);
	});

	it("refuses a URL that is not http(s)", async () => {
		const sent = await probe({ url: "ftp://x" });
		expect(sent.status).toBe(422);
		expect(fetchMock).not.toHaveBeenCalled();
	});

	it("refuses a body without a url", async () => {
		const sent = await probe({});
		expect(sent.status).toBe(400);
	});
});
