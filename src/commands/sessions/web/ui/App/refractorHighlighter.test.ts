import { describe, expect, it } from "vitest";
import { refractorHighlighter } from "./refractorHighlighter";
import { languageForPath } from "./languageForPath";

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

	it.each([
		["Program.cs", "csharp"],
		["scripts/run.csx", "csharp"],
		["Views/Index.cshtml", "cshtml"],
		["Pages/App.razor", "cshtml"],
		["db/migrate.sql", "sql"],
		["build.ps1", "powershell"],
		["Module.psm1", "powershell"],
		["Module.psd1", "powershell"],
		["Cargo.toml", "toml"],
		["setup.ini", "ini"],
		["main.go", "go"],
		["src/lib.rs", "rust"],
		["App.swift", "swift"],
		["Main.kt", "kotlin"],
		["build.gradle.kts", "kotlin"],
		["Main.java", "java"],
		["infra/main.bicep", "bicep"],
		["main.tf", "hcl"],
		["prod.tfvars", "hcl"],
		["config.hcl", "hcl"],
		["fix.diff", "diff"],
		["fix.patch", "diff"],
	])("maps %s to %s", (path, language) => {
		expect(languageForPath(path)).toBe(language);
	});

	it.each([
		["Dockerfile", "docker"],
		["api/Dockerfile", "docker"],
		["api/Dockerfile.dev", "docker"],
		[String.raw`C:\repo\Dockerfile`, "docker"],
		["web/app.dockerfile", "docker"],
		[".editorconfig", "ini"],
		["src/.editorconfig", "ini"],
		[".env", "ini"],
		["api/.env.local", "ini"],
	])("detects %s by file name as %s", (path, language) => {
		expect(languageForPath(path)).toBe(language);
	});

	it.each(["Makefile", "data.unknownext", "notes/Dockerfiles.txt"])(
		"returns undefined for %s",
		(path) => {
			expect(languageForPath(path)).toBeUndefined();
		},
	);
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

	it.each([
		["csharp", 'public class A { string X => "x"; }'],
		["sql", "SELECT id FROM users WHERE name = 'x'"],
		["docker", "FROM node:20\nRUN echo hi"],
		["hcl", 'resource "a" "b" { x = true }'],
		["diff", "-old\n+new"],
	])("tokenizes a %s snippet", (language, source) => {
		const nodes = refractorHighlighter.highlight(source, language) as Node[];
		expect(tokenClasses(nodes).size).toBeGreaterThan(1);
	});
});
