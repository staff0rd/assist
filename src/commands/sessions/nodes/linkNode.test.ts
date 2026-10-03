import { describe, expect, it } from "vitest";
import { toLinkSpec } from "../shared/loadLinkSpecs";
import { buildLink } from "./buildLink";

describe("buildLink", () => {
	it("keeps a direct link's origin", async () => {
		expect(
			await buildLink("pc-windows", "http://127.0.0.1:3101/x", {}, []),
		).toEqual({
			name: "pc-windows",
			url: "http://127.0.0.1:3101",
		});
	});

	it("gives an ssh link a local tunnel port past the other links'", async () => {
		const others = [{ name: "mac", ssh: "mac", port: 3100 }];
		expect(
			await buildLink("pc-wsl", undefined, { ssh: "pc", port: "3100" }, others),
		).toEqual({ name: "pc-wsl", ssh: "pc", port: 3100, localPort: 43101 });
	});

	it("rejects a url together with --ssh, and --ssh without a port", async () => {
		await expect(
			buildLink("pc", "http://127.0.0.1:3100", { ssh: "pc" }, []),
		).rejects.toThrow("only one of");
		await expect(buildLink("pc", undefined, { ssh: "pc" }, [])).rejects.toThrow(
			"--port must be a port number",
		);
	});

	it("writes a tailscale link as an https url on the tailnet's MagicDNS name", async () => {
		const suffix = async () => "tail1234.ts.net";
		expect(
			await buildLink(
				"pc-wsl",
				undefined,
				{ tailscale: "pc", port: "3100" },
				[],
				suffix,
			),
		).toEqual({ name: "pc-wsl", url: "https://pc.tail1234.ts.net:3100" });
		expect(
			await buildLink(
				"pc-wsl",
				undefined,
				{ tailscale: "pc.tail1234.ts.net.", port: "3100" },
				[],
				suffix,
			),
		).toEqual({ name: "pc-wsl", url: "https://pc.tail1234.ts.net:3100" });
	});

	it("rejects --tailscale without a port or together with a url", async () => {
		const suffix = async () => "tail1234.ts.net";
		await expect(
			buildLink("pc", undefined, { tailscale: "pc" }, [], suffix),
		).rejects.toThrow("--port must be a port number");
		await expect(
			buildLink("pc", "http://pc:3100", { tailscale: "pc" }, [], suffix),
		).rejects.toThrow("only one of");
	});
});

describe("toLinkSpec", () => {
	it("dials an ssh link at its tunnel's local end", () => {
		expect(
			toLinkSpec({ name: "pc-wsl", ssh: "pc", port: 3100, localPort: 43100 }),
		).toEqual({
			name: "pc-wsl",
			url: "http://127.0.0.1:43100",
			ssh: { alias: "pc", port: 3100, localPort: 43100 },
		});
	});
});
