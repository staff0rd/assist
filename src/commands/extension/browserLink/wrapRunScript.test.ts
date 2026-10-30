import { describe, expect, it } from "vitest";
import { wrapRunScript } from "./wrapRunScript";

function evaluate(code: string): Promise<unknown> {
	return (0, eval)(wrapRunScript(code));
}

describe("wrapRunScript", () => {
	it("returns the awaited return value serialised as JSON", async () => {
		await expect(
			evaluate("return await Promise.resolve({ a: 1 });"),
		).resolves.toEqual({ value: '{\n  "a": 1\n}' });
	});

	it("returns strings as-is and undefined by name", async () => {
		await expect(evaluate('return "hi";')).resolves.toEqual({ value: "hi" });
		await expect(evaluate("const x = 1;")).resolves.toEqual({
			value: "undefined",
		});
	});

	it("falls back to String for values JSON cannot hold", async () => {
		await expect(
			evaluate("const a = {}; a.self = a; return a;"),
		).resolves.toEqual({ value: "[object Object]" });
	});

	it("returns a thrown error with its stack", async () => {
		const result = (await evaluate('throw new Error("boom");')) as {
			error: string;
		};
		expect(result.error).toMatch(/^Error: boom\n/);
	});
});
