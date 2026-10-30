import { describe, expect, it } from "vitest";
import { defaultNodeName } from "./defaultNodeName";

describe("defaultNodeName", () => {
	it("uses the first label of the host name", () => {
		expect(defaultNodeName("https://mac.tail1234.ts.net:3100")).toBe("mac");
	});

	it("keeps an IPv4 address whole", () => {
		expect(defaultNodeName("http://100.64.0.2:3100")).toBe("100.64.0.2");
	});

	it("returns empty for an invalid URL", () => {
		expect(defaultNodeName("not a url")).toBe("");
	});
});
