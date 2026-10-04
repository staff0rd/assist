import { describe, expect, it } from "vitest";
import { assistConfigSchema } from "./types";

describe("sessions.links", () => {
	it("accepts a url link", () => {
		const links = [{ name: "pc-wsl", url: "https://pc.tail1234.ts.net:3100" }];
		expect(
			assistConfigSchema.parse({ sessions: { links } }).sessions?.links,
		).toEqual(links);
	});

	it("rejects a retired ssh link with a pointer at --tailscale", () => {
		const result = assistConfigSchema.safeParse({
			sessions: { links: [{ name: "pc-wsl", ssh: "pc", port: 3100 }] },
		});
		expect(result.error?.issues).toEqual([
			expect.objectContaining({
				path: ["sessions", "links", 0],
				message: expect.stringContaining(
					"assist sessions nodes link <name> --tailscale <host> --port <port>",
				),
			}),
		]);
	});
});
