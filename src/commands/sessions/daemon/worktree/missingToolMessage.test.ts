import { describe, expect, it } from "vitest";
import { missingToolMessage } from "./missingToolMessage";

describe("missingToolMessage", () => {
	it("names pnpm and how to install it when the shell cannot find it", () => {
		expect(missingToolMessage("pnpm install --frozen-lockfile", 127)).toBe(
			"pnpm is not installed; install it with: npm install -g pnpm (or: corepack enable pnpm)",
		);
	});

	it("recognises cmd.exe's command-not-found exit code", () => {
		expect(missingToolMessage("pnpm install --frozen-lockfile", 9009)).toMatch(
			/^pnpm is not installed/,
		);
	});

	it("names a tool without a known install hint", () => {
		expect(missingToolMessage("make deps", 127)).toBe("make is not installed");
	});

	it("returns null for other failures", () => {
		expect(missingToolMessage("pnpm install --frozen-lockfile", 1)).toBeNull();
		expect(
			missingToolMessage("pnpm install --frozen-lockfile", null),
		).toBeNull();
	});
});
