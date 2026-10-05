import { describe, expect, it, vi } from "vitest";
import { ASSIST_VERSION, PROTOCOL_VERSION } from "../daemon/buildHello";
import { diagnoseLink } from "./diagnoseLink";
import type { DoctorProbes, PeerHealth } from "./DoctorProbes";
import type { TailscaleStatus } from "./tailscaleStatus";

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

const TAILSCALE: TailscaleStatus = {
	BackendState: "Running",
	Self: { DNSName: "mac.tail1234.ts.net.", Online: false },
	Peer: {
		"nodekey:pc": {
			DNSName: "pc.tail1234.ts.net.",
			Online: true,
			TailscaleIPs: ["100.64.0.2"],
		},
	},
};

function probes(overrides: Partial<DoctorProbes> = {}): DoctorProbes {
	return {
		health: async () => HEALTHY,
		hello: async () => HELLO,
		linkState: () => ({ ...SPEC, state: "connected" }),
		tailscale: async () => TAILSCALE,
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

	it("passes the hello hop when the protocol ranges overlap", async () => {
		const result = await diagnoseLink(
			SPEC,
			probes({
				hello: async () => ({
					...HELLO,
					version: "0.0.1",
					protocol: PROTOCOL_VERSION + 1,
					minProtocol: PROTOCOL_VERSION,
				}),
			}),
		);
		expect(result.hops.find((h) => h.hop === "ws")).toMatchObject({
			ok: true,
			detail: `hello 0.0.1 (protocol ${PROTOCOL_VERSION})`,
		});
	});

	it("fails the hello hop when the protocol ranges don't overlap", async () => {
		const result = await diagnoseLink(
			SPEC,
			probes({
				hello: async () => ({
					...HELLO,
					version: "0.0.1",
					protocol: PROTOCOL_VERSION + 1,
				}),
			}),
		);
		expect(result.hops.at(-1)).toMatchObject({
			hop: "ws",
			ok: false,
			error: expect.stringContaining("no common protocol: pc-windows 0.0.1"),
		});
	});

	it("reports a version-blocked link from this node's daemon", async () => {
		const result = await diagnoseLink(
			SPEC,
			probes({
				linkState: () => ({
					...SPEC,
					state: "version-blocked",
					error: "no common protocol",
				}),
			}),
		);
		expect(result.hops.at(-1)).toMatchObject({
			hop: "link",
			ok: false,
			remediation: expect.stringContaining("update the older node"),
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

describe("diagnoseLink over Tailscale", () => {
	const TS_SPEC = {
		name: "pc-windows",
		url: "https://pc.tail1234.ts.net:3101",
	};

	it("probes Tailscale before the peer's web server", async () => {
		const result = await diagnoseLink(TS_SPEC, probes());
		expect(result.ok).toBe(true);
		expect(result.hops[0]).toEqual({
			hop: "tailscale",
			ok: true,
			detail: "pc.tail1234.ts.net online (100.64.0.2)",
		});
		expect(result.hops.map((h) => h.hop)).toEqual([
			"tailscale",
			"web",
			"daemon",
			"ws",
			"link",
		]);
	});

	it("stops when Tailscale is not running here", async () => {
		const health = vi.fn();
		const result = await diagnoseLink(
			TS_SPEC,
			probes({
				tailscale: async () => ({ BackendState: "Stopped" }),
				health,
			}),
		);
		expect(result.hops).toEqual([
			expect.objectContaining({
				hop: "tailscale",
				error: "Tailscale on this node is Stopped",
				remediation: expect.stringContaining(" up` on this node"),
			}),
		]);
		expect(health).not.toHaveBeenCalled();
	});

	it("names the Windows user holding Tailscale and how to run it unattended", async () => {
		const result = await diagnoseLink(
			TS_SPEC,
			probes({
				tailscale: async () =>
					Promise.reject(
						new Error(
							"Command failed: tailscale.exe status --json\nfailed to connect to local tailscaled (which appears to be running as tailscaled.exe, pid 7712). Got error: 401 Unauthorized: Tailscale already in use by pc\\alice, pid 44168",
						),
					),
			}),
		);
		expect(result.hops).toEqual([
			expect.objectContaining({
				hop: "tailscale",
				error: expect.stringContaining(
					String.raw`signed in by Windows user pc\alice`,
				),
				remediation: expect.stringContaining("up --unattended"),
			}),
		]);
	});

	it("reports a peer that is offline or missing from the tailnet", async () => {
		const offline = await diagnoseLink(
			TS_SPEC,
			probes({
				tailscale: async () => ({
					...TAILSCALE,
					Peer: { pc: { DNSName: "pc.tail1234.ts.net.", Online: false } },
				}),
			}),
		);
		expect(offline.hops.at(-1)?.error).toBe(
			"pc.tail1234.ts.net is offline in the tailnet",
		);
		const missing = await diagnoseLink(
			{ ...TS_SPEC, url: "https://nas.tail1234.ts.net:3101" },
			probes(),
		);
		expect(missing.hops.at(-1)?.error).toBe(
			"nas.tail1234.ts.net is not in this node's tailnet",
		);
	});

	it("points at the peer's web server log when its port is not served", async () => {
		const result = await diagnoseLink(
			TS_SPEC,
			probes({ health: async () => Promise.reject(refused()) }),
		);
		expect(result.hops.at(-1)).toMatchObject({
			hop: "web",
			remediation: expect.stringContaining(
				"nothing serves https on 3101 on pc.tail1234.ts.net — pc-windows's web server runs tailscale serve",
			),
		});
	});

	it("points at the peer's web server when tailscale serve answers 502", async () => {
		const badGateway = Object.assign(
			new Error("GET /api/health returned 502"),
			{
				status: 502,
			},
		);
		const result = await diagnoseLink(
			TS_SPEC,
			probes({ health: async () => Promise.reject(badGateway) }),
		);
		expect(result.hops.at(-1)?.remediation).toContain(
			"nothing listens on 127.0.0.1:3101",
		);
	});
});
