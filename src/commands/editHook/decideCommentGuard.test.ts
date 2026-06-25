import { describe, expect, it } from "vitest";
import { decideCommentGuard } from "./decideCommentGuard";
import { type EditHookInput } from "./decideOverrideGuard";

function input(
	tool_name: string,
	tool_input: EditHookInput["tool_input"],
): EditHookInput {
	return { tool_name, tool_input };
}

describe("decideCommentGuard", () => {
	describe("Edit", () => {
		it("blocks introducing a line comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "const a = 1;",
					new_string: "const a = 1; // bump",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("blocks introducing a block comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "const a = 1;",
					new_string: "/* bump */ const a = 1;",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows edits with no comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "const a = 1;",
					new_string: "const a = 2;",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows editing a line that already had the comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "const a = 1; // note",
					new_string: "const a = 2; // note",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("ignores // inside a URL string", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "const u = 1;",
					new_string: 'const u = "https://example.com";',
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("does not gate non-source files", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "README.md",
					old_string: "text",
					new_string: "text // not code",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows adding a machine directive", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "const a: any = 1;",
					new_string: "// @ts-expect-error legacy\nconst a: any = 1;",
				}),
			);

			expect(decision).toBeUndefined();
		});
	});

	describe("MultiEdit", () => {
		it("blocks when any edit introduces a comment", () => {
			const decision = decideCommentGuard(
				input("MultiEdit", {
					file_path: "src/a.ts",
					edits: [
						{ old_string: "const a = 1;", new_string: "const a = 2;" },
						{ old_string: "const b = 1;", new_string: "const b = 2; // why" },
					],
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows when no edit introduces a comment", () => {
			const decision = decideCommentGuard(
				input("MultiEdit", {
					file_path: "src/a.ts",
					edits: [{ old_string: "const a = 1;", new_string: "const a = 2;" }],
				}),
			);

			expect(decision).toBeUndefined();
		});
	});

	describe("Write", () => {
		it("blocks writing content that contains a comment", () => {
			const decision = decideCommentGuard(
				input("Write", {
					file_path: "src/a.ts",
					content: "// header\nconst a = 1;",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows rewriting a file whose comment already existed", () => {
			const decision = decideCommentGuard(
				input("Write", {
					file_path: "src/a.ts",
					content: "// header\nconst a = 2;",
				}),
				"// header\nconst a = 1;",
			);

			expect(decision).toBeUndefined();
		});

		it("allows writing comment-free content", () => {
			const decision = decideCommentGuard(
				input("Write", {
					file_path: "src/a.ts",
					content: "const a = 1;",
				}),
			);

			expect(decision).toBeUndefined();
		});
	});

	describe("other tools", () => {
		it("ignores unrelated tools", () => {
			const decision = decideCommentGuard(
				input("Read", { file_path: "src/a.ts" }),
			);

			expect(decision).toBeUndefined();
		});
	});
});
