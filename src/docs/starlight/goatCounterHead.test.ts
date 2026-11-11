import { describe, expect, it } from "vitest";
import { goatCounterHead } from "./goatCounterHead";

describe("goatCounterHead", () => {
	it.each([undefined, "", "  "])("returns no entries for %j", (code) => {
		expect(goatCounterHead(code)).toEqual([]);
	});

	it("returns the count.js script pointing at the site's count endpoint", () => {
		expect(goatCounterHead(" assist ")).toEqual([
			{
				tag: "script",
				attrs: {
					"data-goatcounter": "https://assist.goatcounter.com/count",
					async: true,
					src: "https://gc.zgo.at/count.js",
				},
			},
		]);
	});
});
