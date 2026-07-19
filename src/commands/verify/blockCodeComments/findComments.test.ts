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
