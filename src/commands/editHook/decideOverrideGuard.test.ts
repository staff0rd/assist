import { describe, expect, it } from "vitest";
import { decideOverrideGuard, type EditHookInput } from "./decideOverrideGuard";

const MARKER = "// assist-maintainability-override: 55";

function input(
	tool_name: string,
	tool_input: EditHookInput["tool_input"],
): EditHookInput {
	return { tool_name, tool_input };
}

describe("decideOverrideGuard", () => {
	describe("Edit", () => {
		it("blocks removing a line that contains the marker", () => {
			const decision = decideOverrideGuard(
				input("Edit", { old_string: MARKER, new_string: "" }),
			);

			expect(decision).toBeDefined();
		});

		it("blocks adding the marker via the new string", () => {
			const decision = decideOverrideGuard(
				input("Edit", { old_string: "const a = 1;", new_string: MARKER }),
			);

			expect(decision).toBeDefined();
		});

		it("allows edits that do not touch the marker", () => {
			const decision = decideOverrideGuard(
				input("Edit", {
					old_string: "const a = 1;",
					new_string: "const a = 2;",
				}),
			);

			expect(decision).toBeUndefined();
		});
	});

	describe("MultiEdit", () => {
		it("blocks when any edit touches the marker", () => {
			const decision = decideOverrideGuard(
				input("MultiEdit", {
					edits: [
						{ old_string: "const a = 1;", new_string: "const a = 2;" },
						{
							old_string: MARKER,
							new_string: "// assist-maintainability-override: 90",
						},
					],
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows when no edit touches the marker", () => {
			const decision = decideOverrideGuard(
				input("MultiEdit", {
					edits: [{ old_string: "const a = 1;", new_string: "const a = 2;" }],
				}),
			);

			expect(decision).toBeUndefined();
		});
	});

	describe("Write", () => {
		it("blocks writing content that contains the marker", () => {
			const decision = decideOverrideGuard(
				input("Write", { content: `${MARKER}\nconst a = 1;` }),
			);

			expect(decision).toBeDefined();
		});

		it("blocks overwriting a file that currently contains the marker", () => {
			const decision = decideOverrideGuard(
				input("Write", { content: "const a = 1;" }),
				`${MARKER}\nconst a = 1;`,
			);

			expect(decision).toBeDefined();
		});

		it("allows writing content with no marker over a file with no marker", () => {
			const decision = decideOverrideGuard(
				input("Write", { content: "const a = 1;" }),
				"const a = 1;",
			);

			expect(decision).toBeUndefined();
		});
	});

	describe("other tools", () => {
		it("ignores unrelated tools", () => {
			const decision = decideOverrideGuard(
				input("Read", { file_path: "a.ts" }),
			);

			expect(decision).toBeUndefined();
		});
	});
});
