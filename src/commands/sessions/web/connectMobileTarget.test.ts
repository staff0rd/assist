import { describe, expect, it } from "vitest";
import type { TailscaleServeConfig } from "../nodes/planServe";
import type { TailscaleStatus } from "../nodes/tailscaleStatus";
import { connectMobileTarget } from "./connectMobileTarget";

const RUNNING: TailscaleStatus = {
	BackendState: "Running",
	CurrentTailnet: { MagicDNSSuffix: "tail1234.ts.net", MagicDNSEnabled: true },
	Self: { DNSName: "pc.tail1234.ts.net." },
};

const SERVING: TailscaleServeConfig = {
	Web: {
		"pc.tail1234.ts.net:4100": {
			Handlers: { "/": { Proxy: "http://127.0.0.1:3100" } },
		},
	},
};

function run(
	overrides: {
		enabled?: boolean;
		status?: () => Promise<TailscaleStatus>;
		serveConfig?: TailscaleServeConfig;
	} = {},
) {
	return connectMobileTarget(3100, {
		enabled: () => overrides.enabled ?? true,
		status: overrides.status ?? (async () => RUNNING),
		serveStatus: async () => overrides.serveConfig ?? SERVING,
		httpsPort: (port) => port + 1000,
		nodeName: () => "pc-wsl",
	});
}

describe("connectMobileTarget", () => {
	it("returns the tailnet serve URL and node name when serving", async () => {
		expect(await run()).toEqual({
			ok: true,
			url: "https://pc.tail1234.ts.net:4100",
			name: "pc-wsl",
		});
	});

	it("explains how to re-enable serve when sessions.tailscaleServe is false", async () => {
		expect(await run({ enabled: false })).toEqual({
			ok: false,
			reason: "sessions.tailscaleServe is false on this node",
			remediation: expect.stringContaining(
				"assist config set sessions.tailscaleServe true --node",
			),
		});
	});

	it("reports Tailscale not running", async () => {
		const result = await run({
			status: async () => ({ BackendState: "Stopped" }),
		});
		expect(result).toMatchObject({
			ok: false,
			reason: "Tailscale is Stopped",
			remediation: expect.stringMatching(/ up`/),
		});
	});

	it("reports Tailscale not installed", async () => {
		const result = await run({
			status: async () => {
				throw Object.assign(new Error("spawn"), { code: "ENOENT" });
			},
		});
		expect(result).toMatchObject({
			ok: false,
			reason: expect.stringMatching(/is not installed$/),
		});
	});

	it("reports serve not proxying this web server", async () => {
		const result = await run({ serveConfig: {} });
		expect(result).toMatchObject({
			ok: false,
			reason:
				"tailscale serve is not proxying https://pc.tail1234.ts.net:4100 to http://127.0.0.1:3100",
			remediation: expect.stringContaining("tailscale serve:"),
		});
	});

	it("surfaces a planServe failure such as MagicDNS being off", async () => {
		const result = await run({
			status: async () => ({ ...RUNNING, CurrentTailnet: null }),
		});
		expect(result).toMatchObject({
			ok: false,
			reason: expect.stringContaining("MagicDNS is off"),
		});
	});
});
