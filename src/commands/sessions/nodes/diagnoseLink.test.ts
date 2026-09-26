import { describe, expect, it, vi } from "vitest";
import { ASSIST_VERSION, PROTOCOL_VERSION } from "../daemon/buildHello";
import { diagnoseLink } from "./diagnoseLink";
import type { DoctorProbes, PeerHealth } from "./DoctorProbes";

vi.mock("../daemon/links/linkVersionCheck", () => ({
	linkVersionCheck: () => "block",
}));

const SPEC = { name: "pc-windows", url: "http://127.0.0.1:3101" };

const HEALTHY: PeerHealth = {
	nodeName: "pc-windows",
	version: ASSIST_VERSION,
	protocol: PROTOCOL_VERSION,
	daemon: { reachable: true },
};

const HELLO = {
	type: "hello",
	version: ASSIST_VERSION,
	protocol: PROTOCOL_VERSION,
	nodeName: "pc-windows",
};

function probes(overrides: Partial<DoctorProbes> = {}): DoctorProbes {
	return {
		health: async () => HEALTHY,
		hello: async () => HELLO,
		linkState: () => ({ ...SPEC, state: "connected" }),
		...overrides,
	};
}

function refused(): Error {
	const cause = Object.assign(
		new Error("connect ECONNREFUSED 127.0.0.1:3101"),
		{
			code: "ECONNREFUSED",
		},
	);
	return new TypeError("fetch failed", { cause });
}

describe("diagnoseLink", () => {
	it("passes every hop for a healthy link", async () => {
		const result = await diagnoseLink(SPEC, probes());
		expect(result.ok).toBe(true);
		expect(result.hops.map((h) => h.hop)).toEqual([
			"web",
			"daemon",
			"ws",
			"link",
		]);
	});

	it("stops at an unreachable web server with the raw error and port remediation", async () => {
		const hello = vi.fn();
		const result = await diagnoseLink(
			SPEC,
			probes({ health: async () => Promise.reject(refused()), hello }),
		);
		expect(result.ok).toBe(false);
		expect(result.hops).toEqual([
			{
				hop: "web",
				ok: false,
				error: "fetch failed: connect ECONNREFUSED 127.0.0.1:3101",
				remediation: expect.stringContaining(
					"nothing listening on 3101 on 127.0.0.1",
				),
			},
		]);
		expect(hello).not.toHaveBeenCalled();
	});

	it("reports a peer whose nodeName differs from the link name", async () => {
		const result = await diagnoseLink(
			SPEC,
			probes({ health: async () => ({ ...HEALTHY, nodeName: "pc-wsl" }) }),
		);
		expect(result.hops.at(-1)?.error).toBe(
			"peer reports nodeName pc-wsl, link expects pc-windows",
		);
	});

	it("stops at the peer daemon before the WebSocket hop", async () => {
		const result = await diagnoseLink(
			SPEC,
			probes({
				health: async () => ({ ...HEALTHY, daemon: { reachable: false } }),
			}),
		);
		expect(result.hops.map((h) => [h.hop, h.ok])).toEqual([
			["web", true],
			["daemon", false],
		]);
	});

	it("fails the hello hop on a version mismatch", async () => {
		const result = await diagnoseLink(
			SPEC,
			probes({ hello: async () => ({ ...HELLO, version: "0.0.1" }) }),
		);
		expect(result.hops.at(-1)).toMatchObject({
			hop: "ws",
			ok: false,
			error: expect.stringContaining("version mismatch: peer 0.0.1"),
		});
	});

	it("reports a latched link from this node's daemon", async () => {
		const result = await diagnoseLink(
			SPEC,
			probes({
				linkState: () => ({
					...SPEC,
					state: "version-blocked",
					error: "update pc-windows manually",
				}),
			}),
		);
		expect(result.hops.at(-1)).toMatchObject({
			hop: "link",
			ok: false,
			remediation: expect.stringContaining("heal latched"),
		});
	});

	it("reports a stopped local daemon", async () => {
		const result = await diagnoseLink(
			SPEC,
			probes({ linkState: () => "no-daemon" }),
		);
		expect(result.hops.at(-1)?.error).toBe("this node's daemon is not running");
	});
});
