import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mockExecSync = vi.fn();

vi.mock("node:child_process", () => ({
	execSync: (...args: unknown[]) => mockExecSync(...args),
}));

import { findComments } from "./findComments";

const SOURCE = [
	"const a = 1;",
	"// a narration comment",
	"const b = 2;",
	"// HACK: formerly justified, now still blocked",
	"const c = 3;",
	"// oxlint-disable-next-line no-explicit-any",
	"const d = 4;",
	"// pre-existing untouched comment",
	"const e = 5;",
	"",
].join("\n");

let tmpDir: string;
let filePath: string;

function diffAddingLine(startLine: number): string {
	return [
		`+++ b/${filePath}`,
		`@@ -1,0 +${startLine},1 @@`,
		"+placeholder",
	].join("\n");
}

beforeEach(() => {
	vi.clearAllMocks();
	tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "block-code-comments-"));
	filePath = path.join(tmpDir, "sample.ts");
	fs.writeFileSync(filePath, SOURCE);
});

afterEach(() => {
	fs.rmSync(tmpDir, { recursive: true, force: true });
});

describe("findComments", () => {
	it("flags a comment added on a changed line", () => {
		mockExecSync.mockReturnValue(diffAddingLine(2));

		const findings = findComments({ ignoreGlobs: [] });

		expect(findings).toEqual([
			{ file: filePath, line: 2, text: "// a narration comment" },
		]);
	});

	it("flags a comment even when it carries a former justification marker", () => {
		mockExecSync.mockReturnValue(diffAddingLine(4));

		const findings = findComments({ ignoreGlobs: [] });

		expect(findings).toEqual([
			{
				file: filePath,
				line: 4,
				text: "// HACK: formerly justified, now still blocked",
			},
		]);
	});

	it("exempts functional machine directives on a changed line", () => {
		mockExecSync.mockReturnValue(diffAddingLine(6));

		const findings = findComments({ ignoreGlobs: [] });

		expect(findings).toEqual([]);
	});

	it("does not flag comments on lines that were not changed", () => {
		mockExecSync.mockReturnValue(diffAddingLine(9));

		const findings = findComments({ ignoreGlobs: [] });

		expect(findings).toEqual([]);
	});

	it("skips files matching an ignore glob", () => {
		mockExecSync.mockReturnValue(diffAddingLine(2));

		const findings = findComments({ ignoreGlobs: ["**/sample.ts"] });

		expect(findings).toEqual([]);
	});
});

const YAML_SOURCE = [
	"# a full-line yaml comment",
	"key: value  # a trailing yaml comment",
	"url: http://example.com#anchor",
	'quoted: "a # b"',
	"# yaml-language-server: $schema=./schema.json",
	"untouched: true # pre-existing comment",
].join("\n");

describe("findComments (yaml)", () => {
	let yamlPath: string;

	function diffAddingYamlLine(startLine: number): string {
		return [
			`+++ b/${yamlPath}`,
			`@@ -1,0 +${startLine},1 @@`,
			"+placeholder",
		].join("\n");
	}

	beforeEach(() => {
		yamlPath = path.join(tmpDir, "sample.yml");
		fs.writeFileSync(yamlPath, YAML_SOURCE);
	});

	it("flags a full-line yaml comment on a changed line", () => {
		mockExecSync.mockReturnValue(diffAddingYamlLine(1));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: yamlPath, line: 1, text: "# a full-line yaml comment" },
		]);
	});

	it("flags a trailing yaml comment on a changed line", () => {
		mockExecSync.mockReturnValue(diffAddingYamlLine(2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: yamlPath, line: 2, text: "# a trailing yaml comment" },
		]);
	});

	it("does not flag # inside a url or quoted string", () => {
		mockExecSync.mockReturnValue(
			[diffAddingYamlLine(3), diffAddingYamlLine(4)].join("\n"),
		);

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("flags a yaml-language-server directive with no exemption", () => {
		mockExecSync.mockReturnValue(diffAddingYamlLine(5));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{
				file: yamlPath,
				line: 5,
				text: "# yaml-language-server: $schema=./schema.json",
			},
		]);
	});

	it("does not flag a yaml comment on an unchanged line", () => {
		mockExecSync.mockReturnValue(diffAddingYamlLine(1));

		const findings = findComments({ ignoreGlobs: [] });

		expect(findings).not.toContainEqual(expect.objectContaining({ line: 6 }));
	});
});

describe("findComments (hash-comment files)", () => {
	function diffAddingLineFor(file: string, startLine: number): string {
		return [`+++ b/${file}`, `@@ -1,0 +${startLine},1 @@`, "+placeholder"].join(
			"\n",
		);
	}

	it("flags a comment added to a Dockerfile", () => {
		const dockerPath = path.join(tmpDir, "Dockerfile");
		fs.writeFileSync(dockerPath, ["FROM node", "# install deps"].join("\n"));
		mockExecSync.mockReturnValue(diffAddingLineFor(dockerPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: dockerPath, line: 2, text: "# install deps" },
		]);
	});

	it("flags a comment added to an .env file", () => {
		const envPath = path.join(tmpDir, "prod.env");
		fs.writeFileSync(envPath, "KEY=value # explain the key");
		mockExecSync.mockReturnValue(diffAddingLineFor(envPath, 1));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: envPath, line: 1, text: "# explain the key" },
		]);
	});

	it("flags a comment below a shell file's leading header block", () => {
		const shPath = path.join(tmpDir, "deploy.sh");
		fs.writeFileSync(
			shPath,
			["#!/bin/bash", "# header note", "echo hi", "# stray note"].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(shPath, 4));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: shPath, line: 4, text: "# stray note" },
		]);
	});

	it("does not flag a comment within a shell file's leading header block", () => {
		const shPath = path.join(tmpDir, "deploy.sh");
		fs.writeFileSync(
			shPath,
			["#!/bin/bash", "# header note", "echo hi"].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(shPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("skips a hash-comment file matching an ignore glob", () => {
		const dockerPath = path.join(tmpDir, "Dockerfile");
		fs.writeFileSync(dockerPath, ["FROM node", "# install deps"].join("\n"));
		mockExecSync.mockReturnValue(diffAddingLineFor(dockerPath, 2));

		expect(findComments({ ignoreGlobs: ["**/Dockerfile"] })).toEqual([]);
	});

	it("exempts a functional machine directive", () => {
		const shPath = path.join(tmpDir, "deploy.sh");
		fs.writeFileSync(
			shPath,
			["#!/bin/bash", "echo hi", "# oxlint-disable-next-line"].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(shPath, 3));

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});
});

describe("findComments (bicep)", () => {
	function diffAddingLineFor(file: string, startLine: number): string {
		return [`+++ b/${file}`, `@@ -1,0 +${startLine},1 @@`, "+placeholder"].join(
			"\n",
		);
	}

	it("flags a // comment added to a .bicep file", () => {
		const bicepPath = path.join(tmpDir, "main.bicep");
		fs.writeFileSync(
			bicepPath,
			["param name string", "// describe the param"].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(bicepPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: bicepPath, line: 2, text: "// describe the param" },
		]);
	});

	it("flags a // comment added to a .bicepparam file", () => {
		const paramPath = path.join(tmpDir, "main.bicepparam");
		fs.writeFileSync(
			paramPath,
			["using 'main.bicep'", "// explain the value"].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(paramPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: paramPath, line: 2, text: "// explain the value" },
		]);
	});

	it("does not flag comment markers inside a bicep string literal", () => {
		const bicepPath = path.join(tmpDir, "main.bicep");
		fs.writeFileSync(bicepPath, "var url = 'https://example.com'");
		mockExecSync.mockReturnValue(diffAddingLineFor(bicepPath, 1));

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});
});

describe("findComments (csharp)", () => {
	function diffAddingLineFor(file: string, startLine: number): string {
		return [`+++ b/${file}`, `@@ -1,0 +${startLine},1 @@`, "+placeholder"].join(
			"\n",
		);
	}

	it("flags a // comment added to a .cs file", () => {
		const csPath = path.join(tmpDir, "Program.cs");
		fs.writeFileSync(csPath, ["var a = 1;", "// explain the value"].join("\n"));
		mockExecSync.mockReturnValue(diffAddingLineFor(csPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: csPath, line: 2, text: "// explain the value" },
		]);
	});

	it("flags a /// xml doc comment", () => {
		const csPath = path.join(tmpDir, "Program.cs");
		fs.writeFileSync(
			csPath,
			[
				"using System;",
				"/// <summary>Runs it.</summary>",
				"void Run() { }",
			].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(csPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: csPath, line: 2, text: "/// <summary>Runs it.</summary>" },
		]);
	});

	it("flags a comment added to a .csx file", () => {
		const csxPath = path.join(tmpDir, "build.csx");
		fs.writeFileSync(csxPath, ["Run();", "/* why */"].join("\n"));
		mockExecSync.mockReturnValue(diffAddingLineFor(csxPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: csxPath, line: 2, text: "/* why */" },
		]);
	});

	it("does not flag comment markers inside csharp string or char literals", () => {
		const csPath = path.join(tmpDir, "Program.cs");
		fs.writeFileSync(
			csPath,
			[
				String.raw`var p = @"C:\a // b";`,
				'var r = """raw // text""";',
				'var i = $"{x} // y";',
				"var c = '/';",
			].join("\n"),
		);
		mockExecSync.mockReturnValue(
			[1, 2, 3, 4].map((line) => diffAddingLineFor(csPath, line)).join("\n"),
		);

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("does not flag preprocessor directives", () => {
		const csPath = path.join(tmpDir, "Program.cs");
		fs.writeFileSync(
			csPath,
			["#nullable enable", "#region Setup", "#pragma warning disable"].join(
				"\n",
			),
		);
		mockExecSync.mockReturnValue(
			[1, 2, 3].map((line) => diffAddingLineFor(csPath, line)).join("\n"),
		);

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("skips a .g.cs file", () => {
		const csPath = path.join(tmpDir, "Routes.g.cs");
		fs.writeFileSync(csPath, ["var a = 1;", "// generated note"].join("\n"));
		mockExecSync.mockReturnValue(diffAddingLineFor(csPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("skips a .Designer.cs file", () => {
		const csPath = path.join(tmpDir, "Main.Designer.cs");
		fs.writeFileSync(csPath, ["var a = 1;", "// generated note"].join("\n"));
		mockExecSync.mockReturnValue(diffAddingLineFor(csPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("skips a file under obj/", () => {
		const objDir = path.join(tmpDir, "obj", "Debug");
		fs.mkdirSync(objDir, { recursive: true });
		const csPath = path.join(objDir, "Api.AssemblyInfo.cs");
		fs.writeFileSync(csPath, ["var a = 1;", "// generated note"].join("\n"));
		mockExecSync.mockReturnValue(diffAddingLineFor(csPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("skips a file whose header marks it auto-generated", () => {
		const csPath = path.join(tmpDir, "Program.cs");
		fs.writeFileSync(
			csPath,
			[
				"// <auto-generated />",
				"using System;",
				"// a note the tool emitted",
			].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(csPath, 3));

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("exempts ReSharper and noinspection directives", () => {
		const csPath = path.join(tmpDir, "Program.cs");
		fs.writeFileSync(
			csPath,
			[
				"using System;",
				"// ReSharper disable once UnusedMember.Local",
				"// ReSharper restore UnusedMember.Local",
				"// noinspection CSharpUnusedLocal",
			].join("\n"),
		);
		mockExecSync.mockReturnValue(
			[2, 3, 4].map((line) => diffAddingLineFor(csPath, line)).join("\n"),
		);

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("does not flag a comment within a leading header block", () => {
		const csPath = path.join(tmpDir, "Program.cs");
		fs.writeFileSync(
			csPath,
			[
				"// Copyright Acme.",
				"// Licensed under MIT.",
				"",
				"using System;",
			].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(csPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("flags a comment below a leading header block", () => {
		const csPath = path.join(tmpDir, "Program.cs");
		fs.writeFileSync(
			csPath,
			["// Copyright Acme.", "using System;", "// a stray note"].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(csPath, 3));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: csPath, line: 3, text: "// a stray note" },
		]);
	});
});

describe("findComments (razor)", () => {
	function diffAddingLineFor(file: string, startLine: number): string {
		return [`+++ b/${file}`, `@@ -1,0 +${startLine},1 @@`, "+placeholder"].join(
			"\n",
		);
	}

	it("flags a razor comment added to a .razor file", () => {
		const razorPath = path.join(tmpDir, "Counter.razor");
		fs.writeFileSync(
			razorPath,
			["<h1>Counter</h1>", "@* the running total *@"].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(razorPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: razorPath, line: 2, text: "@* the running total *@" },
		]);
	});

	it("flags a razor comment spanning multiple lines", () => {
		const razorPath = path.join(tmpDir, "Counter.razor");
		fs.writeFileSync(
			razorPath,
			["<h1>Counter</h1>", "@*", " the running", " total", "*@"].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(razorPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: razorPath, line: 2, text: "@* the running total *@" },
		]);
	});

	it("flags an html comment added to a .cshtml file", () => {
		const cshtmlPath = path.join(tmpDir, "Index.cshtml");
		fs.writeFileSync(
			cshtmlPath,
			["<h1>Home</h1>", "<!-- the landing page -->"].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(cshtmlPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: cshtmlPath, line: 2, text: "<!-- the landing page -->" },
		]);
	});

	it("does not flag an html comment inside an attribute value", () => {
		const razorPath = path.join(tmpDir, "Counter.razor");
		fs.writeFileSync(
			razorPath,
			['<div title="<!-- not a comment -->">x</div>'].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(razorPath, 1));

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("does not flag comment markers inside a csharp string in a code block", () => {
		const razorPath = path.join(tmpDir, "Counter.razor");
		fs.writeFileSync(
			razorPath,
			["@code {", '\tprivate string M = "@* x *@ <!-- y -->";', "}"].join("\n"),
		);
		mockExecSync.mockReturnValue(
			[1, 2, 3].map((line) => diffAddingLineFor(razorPath, line)).join("\n"),
		);

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("reports nothing for a razor file with no comments", () => {
		const razorPath = path.join(tmpDir, "Counter.razor");
		fs.writeFileSync(
			razorPath,
			[
				'@page "/counter"',
				"<h1>Counter</h1>",
				'<a href="https://example.com">docs</a>',
				"@code {",
				"\tprivate int currentCount = 0;",
				"}",
			].join("\n"),
		);
		mockExecSync.mockReturnValue(
			[1, 2, 3, 4, 5, 6]
				.map((line) => diffAddingLineFor(razorPath, line))
				.join("\n"),
		);

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});

	it("exempts a ReSharper directive in a razor comment", () => {
		const razorPath = path.join(tmpDir, "Counter.razor");
		fs.writeFileSync(
			razorPath,
			["<h1>Counter</h1>", "@* ReSharper disable once Html.PathError *@"].join(
				"\n",
			),
		);
		mockExecSync.mockReturnValue(diffAddingLineFor(razorPath, 2));

		expect(findComments({ ignoreGlobs: [] })).toEqual([]);
	});
});

describe("findComments (rust)", () => {
	function diffAddingLinesFor(file: string, lines: number[]): string {
		return [
			`+++ b/${file}`,
			...lines.flatMap((line) => [`@@ -1,0 +${line},1 @@`, "+placeholder"]),
		].join("\n");
	}

	it("flags comments added to a .rs file but not markers in strings", () => {
		const rsPath = path.join(tmpDir, "main.rs");
		fs.writeFileSync(
			rsPath,
			[
				"//! Crate docs.",
				"/// Runs it.",
				"fn run() {",
				'    let url = r#"https://x /* y */"#;',
				"    let a = 1; // explain",
				"}",
			].join("\n"),
		);
		mockExecSync.mockReturnValue(diffAddingLinesFor(rsPath, [1, 2, 4, 5]));

		expect(findComments({ ignoreGlobs: [] })).toEqual([
			{ file: rsPath, line: 1, text: "//! Crate docs." },
			{ file: rsPath, line: 2, text: "/// Runs it." },
			{ file: rsPath, line: 5, text: "// explain" },
		]);
	});
});
