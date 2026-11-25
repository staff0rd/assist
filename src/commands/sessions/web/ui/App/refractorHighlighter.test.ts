import { describe, expect, it } from "vitest";
import { languageForPath, refractorHighlighter } from "./refractorHighlighter";

type Node = {
	type: string;
	properties?: { className?: string[] };
	children?: Node[];
};

function tokenClasses(nodes: Node[]): Set<string> {
	const classes = new Set<string>();
	for (const node of nodes) {
		for (const name of node.properties?.className ?? []) classes.add(name);
		for (const name of tokenClasses(node.children ?? [])) classes.add(name);
	}
	return classes;
}

describe("languageForPath", () => {
	it.each([
		"schema.graphql",
		"api/schema.graphqls",
		"queries/GetUser.gql",
		"SCHEMA.GRAPHQL",
	])("maps %s to graphql", (path) => {
		expect(languageForPath(path)).toBe("graphql");
	});

	it("returns undefined for unknown extensions", () => {
		expect(languageForPath("data.unknownext")).toBeUndefined();
	});
});

describe("refractorHighlighter", () => {
	it("tokenizes a GraphQL schema snippet", () => {
		const source = `"""A registered user"""
type User @key(fields: "id") {
  id: ID!
  name: String
  input: UserInput
}`;
		const classes = tokenClasses(
			refractorHighlighter.highlight(source, "graphql") as Node[],
		);
		for (const name of [
			"description",
			"keyword",
			"class-name",
			"directive",
			"string",
			"scalar",
			"atom-input",
		]) {
			expect(classes).toContain(name);
		}
	});
});
