import { describe, expect, it } from "vitest";
import { isRscRef, makeRscResolver, parseRscRows } from "./parseRscRows";

describe("parseRscRows", () => {
	it("should key each row by its hex id", () => {
		const rows = parseRscRows('1:{"a":1}\n2:["x"]\n3:"hi"');
		expect(rows["1"]).toEqual({ a: 1 });
		expect(rows["2"]).toEqual(["x"]);
		expect(rows["3"]).toBe("hi");
	});

	describe("when a payload is prefixed with a type marker char", () => {
		it("should strip the marker before parsing", () => {
			const rows = parseRscRows('a:I{"id":"x"}');
			expect(rows.a).toEqual({ id: "x" });
		});
	});

	describe("when a line has no hex-id prefix", () => {
		it("should skip it", () => {
			const rows = parseRscRows("not a row\n1:true");
			expect(Object.keys(rows)).toEqual(["1"]);
		});
	});
});

describe("makeRscResolver", () => {
	it("should resolve a bare row reference", () => {
		const resolve = makeRscResolver({ "5": { hello: "world" } });
		expect(resolve("$5")).toEqual({ hello: "world" });
	});

	describe("when the reference has a path", () => {
		it("should walk the path into the row", () => {
			const resolve = makeRscResolver({ "5": { a: { b: ["deep"] } } });
			expect(resolve("$5:a:b:0")).toBe("deep");
		});
	});

	describe("when the path points past a missing value", () => {
		it("should return undefined", () => {
			const resolve = makeRscResolver({ "5": {} });
			expect(resolve("$5:a:b")).toBeUndefined();
		});
	});
});

describe("isRscRef", () => {
	it("should accept a reference string", () => {
		expect(isRscRef("$88:0:1")).toBe(true);
		expect(isRscRef("$L262")).toBe(true);
	});

	describe("when the value is plain text or a lone dollar", () => {
		it("should reject it", () => {
			expect(isRscRef("hello")).toBe(false);
			expect(isRscRef("$")).toBe(false);
		});
	});
});
