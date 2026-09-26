import { describe, expect, it } from "vitest";
import { toLinkSpec } from "../shared/loadLinkSpecs";
import { buildLink } from "./linkNode";

describe("buildLink", () => {
	it("keeps a direct link's origin", () => {
		expect(buildLink("pc-windows", "http://127.0.0.1:3101/x", {}, [])).toEqual({
			name: "pc-windows",
			url: "http://127.0.0.1:3101",
		});
	});

	it("gives an ssh link a local tunnel port past the other links'", () => {
		const others = [{ name: "mac", ssh: "mac", port: 3100 }];
		expect(
			buildLink("pc-wsl", undefined, { ssh: "pc", port: "3100" }, others),
		).toEqual({ name: "pc-wsl", ssh: "pc", port: 3100, localPort: 43101 });
	});

	it("rejects a url together with --ssh, and --ssh without a port", () => {
		expect(() =>
			buildLink("pc", "http://127.0.0.1:3100", { ssh: "pc" }, []),
		).toThrow("not both");
		expect(() => buildLink("pc", undefined, { ssh: "pc" }, [])).toThrow(
			"--port must be a port number",
		);
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
