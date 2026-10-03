import { describe, expect, it } from "vitest";
import { tailnetSuffix } from "./tailnetSuffix";

describe("tailnetSuffix", () => {
	it("reads the current tailnet's MagicDNS suffix", () => {
		expect(
			tailnetSuffix({
				BackendState: "Running",
				MagicDNSSuffix: "old.ts.net",
				CurrentTailnet: {
					MagicDNSSuffix: "tail1234.ts.net",
					MagicDNSEnabled: true,
				},
			}),
		).toBe("tail1234.ts.net");
	});

	it("rejects a stopped Tailscale and a tailnet without MagicDNS", () => {
		expect(() => tailnetSuffix({ BackendState: "Stopped" })).toThrow(
			"Tailscale is not running on this node (Stopped)",
		);
		expect(() =>
			tailnetSuffix({
				BackendState: "Running",
				CurrentTailnet: {
					MagicDNSSuffix: "tail1234.ts.net",
					MagicDNSEnabled: false,
				},
			}),
		).toThrow("MagicDNS is off");
	});
});
