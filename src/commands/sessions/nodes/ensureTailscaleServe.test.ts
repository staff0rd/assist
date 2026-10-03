import { describe, expect, it, vi } from "vitest";
import { ensureTailscaleServe } from "./ensureTailscaleServe";

const STATUS = {
	BackendState: "Running",
	CurrentTailnet: { MagicDNSSuffix: "tail1234.ts.net", MagicDNSEnabled: true },
	Self: { DNSName: "pc.tail1234.ts.net." },
};

function deps(overrides = {}) {
	return {
		enabled: () => true,
		status: async () => STATUS,
		serveStatus: async () => ({}),
		serve: vi.fn(async () => {}),
		sleep: vi.fn(async () => {}),
		...overrides,
	};
}

describe("ensureTailscaleServe", () => {
	it("serves the web server port on the tailnet", async () => {
		const d = deps();
		await expect(ensureTailscaleServe(3110, d)).resolves.toBe(
			"serving http://127.0.0.1:3110 at https://pc.tail1234.ts.net:3110",
		);
		expect(d.serve).toHaveBeenCalledWith([
			"serve",
			"--bg",
			"--https=3110",
			"http://127.0.0.1:3110",
		]);
	});

	it("leaves a port that is already served", async () => {
		const d = deps({
			serveStatus: async () => ({
				Web: {
					"pc.tail1234.ts.net:3110": {
						Handlers: { "/": { Proxy: "http://127.0.0.1:3110" } },
					},
				},
			}),
		});
		await expect(ensureTailscaleServe(3110, d)).resolves.toContain(
			"already serves",
		);
		expect(d.serve).not.toHaveBeenCalled();
	});

	it("skips when disabled, not installed or not running", async () => {
		await expect(
			ensureTailscaleServe(3110, deps({ enabled: () => false })),
		).resolves.toBe("skipped, sessions.tailscaleServe is false");
		await expect(
			ensureTailscaleServe(
				3110,
				deps({
					status: async () =>
						Promise.reject(
							Object.assign(new Error("spawn"), { code: "ENOENT" }),
						),
				}),
			),
		).resolves.toMatch(/is not installed$/);
		await expect(
			ensureTailscaleServe(
				3110,
				deps({ status: async () => ({ BackendState: "Stopped" }) }),
			),
		).resolves.toBe("skipped, Tailscale is Stopped");
	});

	it("retries a rejected serve write", async () => {
		const serve = vi
			.fn()
			.mockRejectedValueOnce(new Error("etag mismatch"))
			.mockResolvedValueOnce(undefined);
		const d = deps({ serve });
		await expect(ensureTailscaleServe(3110, d)).resolves.toMatch(/^serving/);
		expect(serve).toHaveBeenCalledTimes(2);
		expect(d.sleep).toHaveBeenCalledTimes(1);
	});

	it("gives up after repeated failures", async () => {
		const serve = vi.fn().mockRejectedValue(new Error("access denied"));
		await expect(ensureTailscaleServe(3110, deps({ serve }))).rejects.toThrow(
			"access denied",
		);
		expect(serve).toHaveBeenCalledTimes(5);
	});
});
