import { describe, expect, it } from "vitest";
import { describeConfigNode } from "./describeConfigNode";
import { findConfigNode } from "./findConfigNode";
import { parseConfigPath } from "./parseConfigPath";
import { assistConfigSchema } from "./types";

const root = describeConfigNode(assistConfigSchema);

function at(path: string) {
	const parsed = parseConfigPath(path);
	if (!parsed) throw new Error(`Unparseable path ${path}`);
	return findConfigNode(root, parsed);
}

describe("findConfigNode", () => {
	it("resolves an indexed element the same way as the item wildcard", () => {
		expect(at("sql.connections[3].password")).toBe(
			at("sql.connections[].password"),
		);
		expect(at("extension.redirects.git")).toBe(at("extension.redirects.*"));
	});

	it("resolves a field from either variant of a union of objects", () => {
		expect(at("run[].command")).toMatchObject({ kind: "scalar" });
		expect(at("run[].prefix")).toMatchObject({ kind: "scalar" });
	});

	it("returns undefined for a path the schema does not describe", () => {
		expect(at("sql.connections[].nope")).toBeUndefined();
		expect(at("harness.engine.deeper")).toBeUndefined();
		expect(at("deny.pattern")).toBeUndefined();
		expect(at("extension.redirects[0]")).toBeUndefined();
	});

	it("returns the root for an empty path", () => {
		expect(findConfigNode(root, [])).toBe(root);
	});
});
