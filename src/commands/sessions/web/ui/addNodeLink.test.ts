import { describe, expect, it } from "vitest";
import { addNodeLink } from "./addNodeLink";

describe("addNodeLink", () => {
	it("encodes the node URL and name as query parameters", () => {
		expect(addNodeLink("https://pc.tail1234.ts.net:4100", "pc-wsl")).toBe(
			"assist://add-node?url=https%3A%2F%2Fpc.tail1234.ts.net%3A4100&name=pc-wsl",
		);
	});

	it("round-trips names with reserved characters", () => {
		const link = new URL(addNodeLink("https://h.ts.net", "a&b c"));
		expect(link.protocol).toBe("assist:");
		expect(link.searchParams.get("url")).toBe("https://h.ts.net");
		expect(link.searchParams.get("name")).toBe("a&b c");
	});
});
