import refractor from "refractor/core";
import bash from "refractor/lang/bash";
import css from "refractor/lang/css";
import json from "refractor/lang/json";
import markdown from "refractor/lang/markdown";
import markup from "refractor/lang/markup";
import python from "refractor/lang/python";
import tsx from "refractor/lang/tsx";
import typescript from "refractor/lang/typescript";
import yaml from "refractor/lang/yaml";

for (const grammar of [
	markup,
	typescript,
	tsx,
	json,
	css,
	python,
	markdown,
	yaml,
	bash,
]) {
	refractor.register(grammar);
}

const EXTENSION_LANGUAGE: Record<string, string> = {
	ts: "typescript",
	mts: "typescript",
	cts: "typescript",
	tsx: "tsx",
	js: "tsx",
	jsx: "tsx",
	mjs: "tsx",
	cjs: "tsx",
	json: "json",
	css: "css",
	py: "python",
	md: "markdown",
	markdown: "markdown",
	yml: "yaml",
	yaml: "yaml",
	sh: "bash",
	bash: "bash",
	html: "markup",
	htm: "markup",
	xml: "markup",
	svg: "markup",
};

export function languageForPath(path: string): string | undefined {
	const ext = path.split(".").pop()?.toLowerCase();
	return ext ? EXTENSION_LANGUAGE[ext] : undefined;
}

export { refractor as refractorHighlighter };
