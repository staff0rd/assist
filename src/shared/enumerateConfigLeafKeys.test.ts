import { z } from "zod";
import { describe, expect, it } from "vitest";
import { enumerateConfigLeafKeys } from "./enumerateConfigLeafKeys";
import { assistConfigSchema } from "./types";

describe("enumerateConfigLeafKeys", () => {
	it("descends nested objects and unwraps optional/default wrappers", () => {
		const schema = z.strictObject({
			branch: z
				.strictObject({
					prefix: z.string().optional(),
					defaultBranch: z.string().optional(),
				})
				.optional(),
			nested: z
				.strictObject({
					inner: z.strictObject({ value: z.number() }).default({ value: 1 }),
				})
				.default({ inner: { value: 1 } }),
		});
		expect(enumerateConfigLeafKeys(schema)).toEqual([
			"branch.defaultBranch",
			"branch.prefix",
			"nested.inner.value",
		]);
	});

	it("treats arrays and records as leaves", () => {
		const schema = z.strictObject({
			list: z.array(z.strictObject({ name: z.string() })),
			map: z.record(z.string(), z.string()),
		});
		expect(enumerateConfigLeafKeys(schema)).toEqual(["list", "map"]);
	});

	it("covers the real assistConfigSchema", () => {
		const keys = enumerateConfigLeafKeys(assistConfigSchema);
		expect(keys).toContain("branch.prefix");
		expect(keys).toContain("sql.connections");
		expect(keys).toContain("voice.models.vad");
	});
});
