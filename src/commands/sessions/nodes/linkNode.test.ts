import { describe, expect, it } from "vitest";
import { buildLink } from "./buildLink";

describe("buildLink", () => {
	it("keeps a direct link's origin", async () => {
		expect(
			await buildLink("pc-windows", "http://127.0.0.1:3101/x", {}),
		).toEqual({
			name: "pc-windows",
			url: "http://127.0.0.1:3101",
		});
	});

	it("writes a tailscale link as an https url on the tailnet's MagicDNS name", async () => {
		const suffix = async () => "tail1234.ts.net";
		expect(
			await buildLink(
				"pc-wsl",
				undefined,
				{ tailscale: "pc", port: "3100" },
				suffix,
			),
		).toEqual({ name: "pc-wsl", url: "https://pc.tail1234.ts.net:3100" });
		expect(
			await buildLink(
				"pc-wsl",
				undefined,
				{ tailscale: "pc.tail1234.ts.net.", port: "3100" },
				suffix,
			),
		).toEqual({ name: "pc-wsl", url: "https://pc.tail1234.ts.net:3100" });
	});

	it("rejects --tailscale without a port or together with a url", async () => {
		const suffix = async () => "tail1234.ts.net";
		await expect(
			buildLink("pc", undefined, { tailscale: "pc" }, suffix),
		).rejects.toThrow("--port must be a port number");
		await expect(
			buildLink("pc", "http://pc:3100", { tailscale: "pc" }, suffix),
		).rejects.toThrow("only one of");
	});
});
