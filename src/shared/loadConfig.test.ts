import { describe, expect, it } from "vitest";
import { assistConfigSchema } from "./types";

describe("assistConfigSchema deny rules", () => {
	it("accepts config with deny array", () => {
		const raw = {
			deny: [
				{ pattern: "rm -rf", message: "Do not use rm -rf" },
				{
					pattern: "git push --force",
					message: "Use --force-with-lease instead",
				},
			],
		};
		const result = assistConfigSchema.parse(raw);
		expect(result.deny).toEqual([
			{ pattern: "rm -rf", message: "Do not use rm -rf" },
			{
				pattern: "git push --force",
				message: "Use --force-with-lease instead",
			},
		]);
	});

	it("accepts config without deny (optional)", () => {
		const result = assistConfigSchema.parse({});
		expect(result.deny).toBeUndefined();
	});

	it("rejects deny entry missing message", () => {
		const raw = { deny: [{ pattern: "rm -rf" }] };
		expect(() => assistConfigSchema.parse(raw)).toThrow();
	});

	it("rejects deny entry missing pattern", () => {
		const raw = { deny: [{ message: "no" }] };
		expect(() => assistConfigSchema.parse(raw)).toThrow();
	});

	it("rejects deny entry with extra keys (strictObject)", () => {
		const raw = { deny: [{ pattern: "rm", message: "no", extra: true }] };
		expect(() => assistConfigSchema.parse(raw)).toThrow();
	});
});
