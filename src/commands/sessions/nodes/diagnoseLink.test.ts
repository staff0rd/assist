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
		sshAgent: async () => ({ status: "ok", keys: 1 }),
		ssh: async () => ({ code: 0, stderr: "" }),
		tunnel: async () => true,
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

describe("diagnoseLink over ssh", () => {
	const SSH_SPEC = {
		name: "pc-windows",
		url: "http://127.0.0.1:43101",
		ssh: { alias: "pc", port: 3101, localPort: 43101 },
	};

	it("probes agent, ssh and tunnel before the peer's web server", async () => {
		const result = await diagnoseLink(SSH_SPEC, probes());
		expect(result.ok).toBe(true);
		expect(result.hops.map((h) => h.hop)).toEqual([
			"agent",
			"ssh",
			"tunnel",
			"web",
			"daemon",
			"ws",
			"link",
		]);
	});

	it("reports a missing IdentityAgent", async () => {
		const ssh = vi.fn();
		const result = await diagnoseLink(
			SSH_SPEC,
			probes({ sshAgent: async () => ({ status: "missing" }), ssh }),
		);
		expect(result.hops).toEqual([
			expect.objectContaining({
				hop: "agent",
				remediation: expect.stringContaining("IdentityAgent missing"),
			}),
		]);
		expect(ssh).not.toHaveBeenCalled();
	});

	it("reports an unreachable 1Password agent", async () => {
		const result = await diagnoseLink(
			SSH_SPEC,
			probes({
				sshAgent: async () => ({
					status: "unreachable",
					error: "Error connecting to agent: No such file or directory",
				}),
			}),
		);
		expect(result.hops.at(-1)?.remediation).toContain(
			"1Password SSH agent not reachable",
		);
	});

	it("reports Remote Login off when sshd refuses", async () => {
		const result = await diagnoseLink(
			SSH_SPEC,
			probes({
				ssh: async () => ({
					code: 255,
					stderr: "ssh: connect to host pc port 22: Connection refused",
				}),
			}),
		);
		expect(result.hops.at(-1)).toMatchObject({
			hop: "ssh",
			ok: false,
			error: "ssh: connect to host pc port 22: Connection refused",
			remediation: expect.stringContaining("Remote Login is off on pc"),
		});
	});

	it("points at the daemon when the tunnel is not bound", async () => {
		const result = await diagnoseLink(
			SSH_SPEC,
			probes({ tunnel: async () => false }),
		);
		expect(result.hops.at(-1)).toMatchObject({
			hop: "tunnel",
			error: "nothing bound on 127.0.0.1:43101",
			remediation: expect.stringContaining("link pc-windows tunnel:"),
		});
	});

	it("reports nothing listening on the peer port through the tunnel", async () => {
		const closed = new TypeError("fetch failed", {
			cause: Object.assign(new Error("other side closed"), {
				code: "UND_ERR_SOCKET",
			}),
		});
		const result = await diagnoseLink(
			SSH_SPEC,
			probes({ health: async () => Promise.reject(closed) }),
		);
		expect(result.hops.at(-1)).toMatchObject({
			hop: "web",
			remediation: expect.stringContaining(
				"nothing listening on 3101 on pc — is project-switch running pc-windows's web server?",
			),
		});
	});
});
