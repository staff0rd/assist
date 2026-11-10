import { Command } from "commander";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { draftFeature } from "../shared/harnessAdapters/harnessFeatures";

vi.mock("./backlog/launchMode", () => ({
	launchMode: vi.fn(),
}));

vi.mock("./backlog/resolveHarness", () => ({
	resolveHarness: vi.fn((value?: string) => value ?? "codex"),
}));

import { launchMode } from "./backlog/launchMode";
import { resolveHarness } from "./backlog/resolveHarness";
import { registerDescriptionLaunch } from "./registerDescriptionLaunch";

async function parse(name: "draft" | "bug", args: string[]): Promise<void> {
	const program = new Command();
	registerDescriptionLaunch(program, name, name, "", draftFeature, "");
	await program.parseAsync(["node", "assist", name, ...args]);
}

describe("registerDescriptionLaunch", () => {
	beforeEach(() => vi.clearAllMocks());

	it.each(["draft", "bug"] as const)(
		"resolves the %s type's default harness when --harness is omitted",
		async (name) => {
			await parse(name, ["a thing"]);

			expect(resolveHarness).toHaveBeenCalledWith(undefined, name);
			expect(launchMode).toHaveBeenCalledWith(
				name,
				expect.objectContaining({ harness: "codex", description: "a thing" }),
			);
		},
	);

	it("passes an explicit --harness through", async () => {
		await parse("draft", ["--harness", "pi"]);

		expect(resolveHarness).toHaveBeenCalledWith("pi", "draft");
		expect(launchMode).toHaveBeenCalledWith(
			"draft",
			expect.objectContaining({ harness: "pi" }),
		);
	});
});
