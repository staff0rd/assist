import { describe, expect, it } from "vitest";
import type { ConfigEntry } from "../../../../../../../../../../../../config/readConfigEntries";
import { configArrayItems } from "./configArrayItems";

function runEntry(entry: Partial<ConfigEntry>): ConfigEntry {
	return {
		key: "run",
		type: "array",
		value: undefined,
		source: "default",
		...entry,
	};
}

describe("configArrayItems", () => {
	it("attributes each merged item to the layer that contributes it", () => {
		const items = configArrayItems(
			runEntry({
				source: "project",
				layers: {
					global: [{ name: "build" }, { name: "test" }],
					project: [{ name: "test", command: "vitest" }],
				},
			}),
		);

		expect(items).toEqual([
			{ value: { name: "build" }, owner: { scope: "global", indexInScope: 0 } },
			{
				value: { name: "test", command: "vitest" },
				owner: { scope: "project", indexInScope: 0 },
			},
		]);
	});

	it("leaves items from the schema default unowned", () => {
		const items = configArrayItems(
			runEntry({ defaultValue: [{ name: "build" }], layers: {} }),
		);

		expect(items).toEqual([{ value: { name: "build" } }]);
	});

	it("returns nothing for a key set nowhere and with no default", () => {
		expect(configArrayItems(runEntry({ layers: {} }))).toEqual([]);
	});
});
