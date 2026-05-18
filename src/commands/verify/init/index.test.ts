import { beforeEach, describe, expect, it, vi } from "vitest";
import type { ScriptWriter } from "../installPackage";

const mockRequirePackageJson = vi.fn();
const mockDetectExistingSetup = vi.fn();
const mockGetAvailableOptions = vi.fn();
const mockGetSetupHandlers = vi.fn();
const mockPromptMultiselect = vi.fn();
const mockSetupVerifyScript = vi.fn();
const mockSetupVerifyRunEntry = vi.fn();

vi.mock("../../../shared/readPackageJson", () => ({
	requirePackageJson: () => mockRequirePackageJson(),
}));

vi.mock("./detectExistingSetup", () => ({
	detectExistingSetup: (...args: unknown[]) => mockDetectExistingSetup(...args),
}));

vi.mock("./getAvailableOptions", () => ({
	getAvailableOptions: (...args: unknown[]) => mockGetAvailableOptions(...args),
}));

vi.mock("./getSetupHandlers", () => ({
	getSetupHandlers: (...args: unknown[]) => mockGetSetupHandlers(...args),
}));

vi.mock("../../../shared/promptMultiselect", () => ({
	promptMultiselect: (...args: unknown[]) => mockPromptMultiselect(...args),
}));

vi.mock("../installPackage", () => ({
	setupVerifyScript: (...args: unknown[]) => mockSetupVerifyScript(...args),
}));

vi.mock("../setupVerifyRunEntry", () => ({
	setupVerifyRunEntry: (...args: unknown[]) => mockSetupVerifyRunEntry(...args),
}));

import { init } from "./index";

describe("verify init", () => {
	let capturedWriter: ScriptWriter | undefined;

	beforeEach(() => {
		vi.clearAllMocks();
		capturedWriter = undefined;

		mockRequirePackageJson.mockReturnValue({
			packageJsonPath: "/tmp/package.json",
			pkg: {},
		});
		mockDetectExistingSetup.mockReturnValue({
			hasVite: false,
			hasTypescript: false,
			hasOpenColor: false,
		});
		mockGetAvailableOptions.mockReturnValue([
			{ name: "knip", value: "knip", description: "" },
		]);
		mockPromptMultiselect.mockResolvedValue(["knip"]);
		mockGetSetupHandlers.mockReturnValue({
			knip: async (_path: string, writer: ScriptWriter) => {
				capturedWriter = writer;
				writer("verify:knip", "knip");
			},
		});
	});

	it("writes to assist.yml by default (setupVerifyRunEntry)", async () => {
		await init();

		expect(capturedWriter).toBeDefined();
		expect(mockSetupVerifyRunEntry).toHaveBeenCalledWith("verify:knip", "knip");
		expect(mockSetupVerifyScript).not.toHaveBeenCalled();
	});

	it("writes to package.json when --package-json flag is set", async () => {
		await init({ packageJson: true });

		expect(capturedWriter).toBeDefined();
		expect(mockSetupVerifyScript).toHaveBeenCalledWith(
			"/tmp/package.json",
			"verify:knip",
			"knip",
			undefined,
		);
		expect(mockSetupVerifyRunEntry).not.toHaveBeenCalled();
	});
});
