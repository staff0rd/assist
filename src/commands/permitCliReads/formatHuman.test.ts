import { describe, expect, it } from "vitest";
import { formatHuman } from "./formatHuman";

describe("formatHuman", () => {
	describe("when given commands", () => {
		it("should include the count header", () => {
			const result = formatHuman("kubectl", [
				{ path: ["get", "pods"], description: "List pods" },
			]);

			expect(result).toContain('Discovered 1 commands for "kubectl"');
		});

		it("should show read commands with R prefix", () => {
			const result = formatHuman("kubectl", [
				{ path: ["list"], description: "List items" },
			]);

			expect(result).toContain(" R  kubectl list — List items");
		});

		it("should show write commands with W prefix", () => {
			const result = formatHuman("kubectl", [
				{ path: ["delete"], description: "Delete item" },
			]);

			expect(result).toContain(" W  kubectl delete — Delete item");
		});

		it("should show unknown commands with ? prefix", () => {
			const result = formatHuman("kubectl", [
				{ path: ["foo"], description: "" },
			]);

			expect(result).toContain(" ?  kubectl foo");
		});
	});

	describe("when commands have no description", () => {
		it("should omit the dash separator", () => {
			const result = formatHuman("cli", [
				{ path: ["run"], description: "" },
			]);

			expect(result).not.toContain("—");
		});
	});

	describe("when given multiple commands", () => {
		it("should sort alphabetically", () => {
			const result = formatHuman("cli", [
				{ path: ["zebra"], description: "" },
				{ path: ["alpha"], description: "" },
			]);

			const lines = result.split("\n");
			const cmdLines = lines.filter((l) => l.includes("cli "));
			expect(cmdLines[0]).toContain("alpha");
			expect(cmdLines[1]).toContain("zebra");
		});
	});
});
