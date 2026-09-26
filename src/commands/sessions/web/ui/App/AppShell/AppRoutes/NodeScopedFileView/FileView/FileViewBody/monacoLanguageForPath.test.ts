import { describe, expect, it } from "vitest";
import { monacoLanguageForPath } from "./monacoLanguageForPath";

describe("monacoLanguageForPath", () => {
	it("maps typescript sources to typescript", () => {
		expect(monacoLanguageForPath("src/a.ts")).toBe("typescript");
		expect(monacoLanguageForPath("src/a.tsx")).toBe("typescript");
		expect(monacoLanguageForPath("src/a.mts")).toBe("typescript");
	});

	it("maps javascript sources to javascript", () => {
		expect(monacoLanguageForPath("src/a.js")).toBe("javascript");
		expect(monacoLanguageForPath("src/a.cjs")).toBe("javascript");
	});

	it("falls back to typescript for json, which has no basic language", () => {
		expect(monacoLanguageForPath("package.json")).toBe("typescript");
	});

	it("maps both yaml extensions", () => {
		expect(monacoLanguageForPath("assist.yml")).toBe("yaml");
		expect(monacoLanguageForPath("assist.yaml")).toBe("yaml");
	});

	it("maps shell scripts to shell", () => {
		expect(monacoLanguageForPath("scripts/run.sh")).toBe("shell");
	});

	it("ignores extension case", () => {
		expect(monacoLanguageForPath("README.MD")).toBe("markdown");
	});

	it("returns undefined for an unknown extension", () => {
		expect(monacoLanguageForPath("notes.unknownext")).toBeUndefined();
	});

	it("returns undefined for a path with no extension", () => {
		expect(monacoLanguageForPath("Makefile")).toBeUndefined();
	});
});
