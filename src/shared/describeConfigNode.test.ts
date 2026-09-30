import { describe, expect, it } from "vitest";
import { z } from "zod";
import type { ConfigNode, ConfigObjectNode } from "./ConfigNode";
import { describeConfigNode } from "./describeConfigNode";
import { findConfigNode } from "./findConfigNode";
import { formatConfigPath } from "./formatConfigPath";
import { parseConfigPath } from "./parseConfigPath";
import { assistConfigSchema } from "./types";

const root = describeConfigNode(assistConfigSchema);

function node(path: string): ConfigNode {
	const parsed = parseConfigPath(path);
	if (!parsed) throw new Error(`Unparseable path ${path}`);
	const found = findConfigNode(root, parsed);
	if (!found) throw new Error(`No node at ${path}`);
	return found;
}

function fieldNames(object: ConfigObjectNode): string[] {
	return object.fields.map((field) => {
		const last = field.path.at(-1);
		return last?.kind === "key" ? last.name : "?";
	});
}

function objectListItem(path: string): ConfigObjectNode {
	const found = node(path);
	if (found.kind !== "objectList" || found.item.kind !== "object")
		throw new Error(`${path} is not a list of objects`);
	return found.item;
}

describe("describeConfigNode", () => {
	it("describes deny as a list of objects with typed fields", () => {
		expect(node("deny").kind).toBe("objectList");
		expect(fieldNames(objectListItem("deny"))).toEqual(["pattern", "message"]);
		expect(node("deny[].pattern")).toMatchObject({
			kind: "scalar",
			type: "string",
		});
	});

	it("describes the three connection arrays as lists of objects", () => {
		expect(fieldNames(objectListItem("sql.connections"))).toEqual([
			"name",
			"server",
			"port",
			"user",
			"password",
			"database",
		]);
		expect(fieldNames(objectListItem("seq.connections"))).toEqual([
			"name",
			"url",
			"apiToken",
		]);
		expect(fieldNames(objectListItem("ravendb.connections"))).toEqual([
			"name",
			"url",
			"database",
			"apiKeyRef",
		]);
		expect(node("sql.connections[].port")).toMatchObject({
			kind: "scalar",
			type: "number",
		});
	});

	it("recurses into a string list nested inside an array element", () => {
		expect(node("forbiddenStrings[].paths")).toMatchObject({
			kind: "scalarList",
			itemType: "string",
			item: { kind: "scalar", type: "string" },
		});
		expect(node("forbiddenStrings[].disallowed")).toMatchObject({
			kind: "scalar",
			type: "string",
		});
	});

	it("describes cliReadVerbs and devlog.skip as records of string lists", () => {
		for (const key of ["cliReadVerbs", "devlog.skip"]) {
			expect(node(key).kind).toBe("record");
			expect(node(`${key}.*`)).toMatchObject({
				kind: "scalarList",
				itemType: "string",
			});
		}
	});

	it("describes run as a list of two object variants", () => {
		const run = node("run");
		if (run.kind !== "objectList" || run.item.kind !== "unionOfObjects")
			throw new Error("run is not a list of object variants");

		expect(run.item.variants.map(fieldNames)).toEqual([
			[
				"name",
				"command",
				"args",
				"params",
				"env",
				"filter",
				"pre",
				"cwd",
				"quiet",
				"server",
				"port",
			],
			["link", "prefix"],
		]);
	});

	it("recurses through a run entry into its params array and env record", () => {
		expect(node("run[].params")).toMatchObject({ kind: "objectList" });
		expect(fieldNames(objectListItem("run[].params"))).toEqual([
			"name",
			"required",
			"default",
			"description",
		]);
		expect(node("run[].params[].required")).toMatchObject({
			kind: "scalar",
			type: "boolean",
			optional: true,
		});
		expect(node("run[].params[].name").optional).toBeUndefined();
		expect(node("run[].env")).toMatchObject({ kind: "record" });
		expect(node("run[].env.*")).toMatchObject({
			kind: "scalar",
			type: "string",
		});
	});

	it("carries the path, defaults and enum members of scalar leaves", () => {
		expect(formatConfigPath(node("sql.connections[].password").path)).toBe(
			"sql.connections[].password",
		);
		expect(node("harness.engine")).toMatchObject({
			kind: "scalar",
			type: "enum",
			enumValues: ["claude", "codex", "pi"],
			defaultValue: "claude",
		});
		expect(node("run[].server")).toMatchObject({
			kind: "scalar",
			type: "union",
			unionTypes: ["boolean", "string"],
		});
		expect(node("worktree.install")).toMatchObject({
			kind: "other",
			type: "other",
			defaultValue: true,
		});
		expect(node("worktree.copy")).toMatchObject({
			kind: "scalarList",
			itemType: "string",
		});
	});

	it("falls back to an opaque node for a shape it cannot edit", () => {
		const schema = z.strictObject({
			mixed: z.union([z.string(), z.array(z.string())]),
			anything: z.unknown(),
			listOfLists: z.array(z.array(z.string())),
		});
		const opaque = describeConfigNode(schema);
		const at = (key: string) =>
			findConfigNode(opaque, [{ kind: "key", name: key }]);

		expect(at("mixed")).toMatchObject({ kind: "other", type: "other" });
		expect(at("anything")).toMatchObject({ kind: "other", type: "other" });
		expect(at("listOfLists")).toMatchObject({ kind: "other", type: "array" });
	});
});
