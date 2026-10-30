import { describe, expect, it } from "vitest";
import { parseNodeUrl } from "./parseNodeUrl";

describe("parseNodeUrl", () => {
	it("keeps only the origin of a node URL", () => {
		expect(parseNodeUrl(" https://mac.tail1234.ts.net:3100/sessions ")).toBe(
			"https://mac.tail1234.ts.net:3100",
		);
	});

	it("assumes https when no scheme is given", () => {
		expect(parseNodeUrl("mac.tail1234.ts.net:3100")).toBe(
			"https://mac.tail1234.ts.net:3100",
		);
	});

	it("rejects non-http schemes and garbage", () => {
		expect(parseNodeUrl("ftp://mac:3100")).toBeUndefined();
		expect(parseNodeUrl("https://")).toBeUndefined();
	});
});
