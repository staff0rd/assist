import { readFileSync } from "node:fs";
import path from "node:path";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mockRunAudit = vi.fn();
const mockDetect = vi.fn();
const mockLoadConfig = vi.fn();

vi.mock("./audit/runAudit", () => ({
	runAudit: (...args: unknown[]) => mockRunAudit(...args),
}));
vi.mock("./audit/detectPackageManager", () => ({
	detectPackageManager: (...args: unknown[]) => mockDetect(...args),
}));
vi.mock("../../shared/loadConfig", () => ({
	loadConfig: () => mockLoadConfig(),
}));

import { audit } from "./audit";

class ExitError extends Error {
	constructor(readonly code: number | undefined) {
		super(`exit ${code}`);
		this.name = "ExitError";
	}
}

const pnpmFixture = readFileSync(
	path.join(__dirname, "audit", "fixtures", "pnpmAudit.json"),
	"utf8",
);

function runAndCapture(): { code: number | undefined; output: string } {
	const logs: string[] = [];
	vi.spyOn(console, "log").mockImplementation((line: string) => {
		logs.push(line);
	});
	vi.spyOn(process, "exit").mockImplementation((code) => {
		throw new ExitError(code as number | undefined);
	});
	try {
		audit();
	} catch (error) {
		if (error instanceof ExitError)
			return { code: error.code, output: logs.join("\n") };
		throw error;
	}
	throw new Error("audit did not exit");
}

describe("verify audit", () => {
	beforeEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		mockDetect.mockReturnValue("pnpm");
		mockLoadConfig.mockReturnValue({});
	});

	it("exits 1 and lists high advisories", () => {
		mockRunAudit.mockReturnValue({ stdout: pnpmFixture });
		const { code, output } = runAndCapture();
		expect(code).toBe(1);
		expect(output).toContain("HIGH effect GHSA-7589-6fvf-x4pw");
	});

	it("exits 0 when the high advisory is ignored", () => {
		mockRunAudit.mockReturnValue({ stdout: pnpmFixture });
		mockLoadConfig.mockReturnValue({
			verify: { audit: { level: "high", ignore: ["GHSA-7589-6fvf-x4pw"] } },
		});
		expect(runAndCapture().code).toBe(0);
	});

	it("warns and passes when the audit cannot run", () => {
		mockRunAudit.mockReturnValue({ error: "spawnSync pnpm ETIMEDOUT" });
		const { code, output } = runAndCapture();
		expect(code).toBe(0);
		expect(output).toContain("could not run");
	});

	it("warns and passes when the audit output is not a report", () => {
		mockRunAudit.mockReturnValue({ stdout: "ERR_PNPM_AUDIT_BAD_RESPONSE" });
		expect(runAndCapture().code).toBe(0);
	});

	it("warns and passes without a lockfile", () => {
		mockDetect.mockReturnValue(undefined);
		const { code, output } = runAndCapture();
		expect(code).toBe(0);
		expect(output).toContain("no pnpm-lock.yaml");
		expect(mockRunAudit).not.toHaveBeenCalled();
	});
});
