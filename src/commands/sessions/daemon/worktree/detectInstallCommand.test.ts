import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectInstallCommand } from "./detectInstallCommand";

let dir: string;

function touch(...names: string[]): void {
	for (const name of names) writeFileSync(join(dir, name), "");
}

beforeEach(() => {
	dir = mkdtempSync(join(tmpdir(), "detect-install-"));
});

afterEach(() => {
	rmSync(dir, { recursive: true, force: true });
});

describe("detectInstallCommand", () => {
	it("returns null without a package.json", () => {
		expect(detectInstallCommand(dir)).toBeNull();
	});

	it("runs npm ci when a package-lock.json exists", () => {
		touch("package.json", "package-lock.json");
		expect(detectInstallCommand(dir)).toBe("npm ci");
	});

	it("runs npm install without a lockfile", () => {
		touch("package.json");
		expect(detectInstallCommand(dir)).toBe("npm install");
	});

	it("runs a frozen-lockfile pnpm install when a pnpm-lock.yaml exists", () => {
		touch("package.json", "pnpm-lock.yaml");
		expect(detectInstallCommand(dir)).toBe("pnpm install --frozen-lockfile");
	});

	it("prefers pnpm over a package-lock.json", () => {
		touch("package.json", "package-lock.json", "pnpm-lock.yaml");
		expect(detectInstallCommand(dir)).toBe("pnpm install --frozen-lockfile");
	});
});
