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

		it("uses the // marker in the deny message", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "const a = 1;",
					new_string: "const a = 1; // bump",
				}),
			);

			expect(decision).toContain("(//)");
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

		it("allows trimming a sentence from a comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "const a = 1; // keep this. remove this stale bit.",
					new_string: "const a = 1; // keep this.",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows trimming a comment to a word subset", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "const a = 1; // the quick brown fox jumps",
					new_string: "const a = 1; // quick fox",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("blocks an edit that adds a word not in the removed comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "const a = 1; // keep this. remove this stale bit.",
					new_string: "const a = 1; // keep this fresh idea.",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows trimming a block comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "/* keep this. remove this stale bit. */ const a = 1;",
					new_string: "/* keep this. */ const a = 1;",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("blocks a block comment that adds a new word", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "/* keep this. */ const a = 1;",
					new_string: "/* keep this brand new thing. */ const a = 1;",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows fully deleting a comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/a.ts",
					old_string: "const a = 1; // stale note",
					new_string: "const a = 1;",
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

	describe("yaml", () => {
		it("blocks introducing a full-line # comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "config.yml",
					old_string: "port: 8080",
					new_string: "# the http port\nport: 8080",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("blocks introducing a trailing # comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "config.yaml",
					old_string: "port: 8080",
					new_string: "port: 8080 # the http port",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("blocks a # yaml-language-server directive (no exemptions)", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "config.yml",
					old_string: "port: 8080",
					new_string: "# yaml-language-server: $schema=./s.json\nport: 8080",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows a # inside a quoted string", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "config.yml",
					old_string: "colour: red",
					new_string: 'colour: "#ff0000"',
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows a # inside a url value", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "config.yml",
					old_string: "url: x",
					new_string: "url: https://example.com/page#anchor",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows a mid-scalar # (no preceding whitespace)", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "config.yml",
					old_string: "ref: x",
					new_string: "ref: v1#stable",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows editing a line that already had the # comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "config.yml",
					old_string: "port: 8080 # the http port",
					new_string: "port: 9090 # the http port",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("uses the # marker in the deny message", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "config.yml",
					old_string: "port: 8080",
					new_string: "port: 8080 # note",
				}),
			);

			expect(decision).toContain("(#)");
		});

		it("does not treat // as a comment in yaml", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "config.yml",
					old_string: "path: x",
					new_string: "path: a//b",
				}),
			);

			expect(decision).toBeUndefined();
		});
	});

	describe("hash-comment files", () => {
		it("blocks introducing a # comment in a Dockerfile", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "Dockerfile",
					old_string: "RUN npm ci",
					new_string: "RUN npm ci # install deps",
				}),
			);

			expect(decision).toBeDefined();
			expect(decision).toContain("(#)");
		});

		it("blocks introducing a # comment in a Dockerfile variant", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "web.dockerfile",
					old_string: "FROM node:20",
					new_string: "# base image\nFROM node:20",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("blocks introducing a # comment in a .env file", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: ".env.local",
					old_string: "PORT=8080",
					new_string: "PORT=8080 # the http port",
				}),
			);

			expect(decision).toBeDefined();
			expect(decision).toContain("(#)");
		});

		it("allows a comment inside the .sh leading header block", () => {
			const decision = decideCommentGuard(
				input("Write", {
					file_path: "deploy.sh",
					content: "#!/bin/bash\n# deploys the app\nset -e\necho go",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("blocks a # comment below the .sh header block", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "deploy.sh",
					old_string: "echo go",
					new_string: "echo go\n# stray note",
				}),
			);

			expect(decision).toBeDefined();
			expect(decision).toContain("(#)");
		});

		it("allows editing a below-header .sh line without a comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "deploy.sh",
					old_string: "echo go",
					new_string: "echo done",
				}),
			);

			expect(decision).toBeUndefined();
		});
	});

	describe("bicep", () => {
		it("blocks introducing a // comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "main.bicep",
					old_string: "param location string",
					new_string: "param location string // deploy region",
				}),
			);

			expect(decision).toBeDefined();
			expect(decision).toContain("(//)");
		});

		it("blocks introducing a /* */ comment in a .bicepparam file", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "main.bicepparam",
					old_string: "param location = 'westus'",
					new_string: "/* pinned region */ param location = 'westus'",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows a // inside a bicep string literal", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "main.bicep",
					old_string: "var endpoint = 'x'",
					new_string: "var endpoint = 'https://example.com'",
				}),
			);

			expect(decision).toBeUndefined();
		});
	});

	describe("csharp", () => {
		it("blocks introducing a // comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Program.cs",
					old_string: "var a = 1;",
					new_string: "var a = 1; // bump",
				}),
			);

			expect(decision).toBeDefined();
			expect(decision).toContain("(//)");
		});

		it("blocks introducing a /// xml doc comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Program.cs",
					old_string: "void Run() { }",
					new_string: "/// <summary>Runs.</summary>\nvoid Run() { }",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("blocks introducing a block comment via Write", () => {
			const decision = decideCommentGuard(
				input("Write", {
					file_path: "src/Program.cs",
					content: "/* header */\nvar a = 1;",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("blocks introducing a comment in a .csx script", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "build.csx",
					old_string: "Run();",
					new_string: "Run(); // go",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows a // inside a verbatim string", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Program.cs",
					old_string: "var p = 1;",
					new_string: 'var p = @"C:\\a // b";',
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows a // inside a raw string", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Program.cs",
					old_string: "var s = 1;",
					new_string: 'var s = """raw // text""";',
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows a // inside an interpolated string", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Program.cs",
					old_string: "var s = 1;",
					new_string: 'var s = $"{x} // y";',
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows a slash char literal", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Program.cs",
					old_string: "var c = 'x';",
					new_string: "var c = '/';",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows a comment in a .g.cs file", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Api/Routes.g.cs",
					old_string: "var a = 1;",
					new_string: "var a = 1; // generated",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows a comment in a .Designer.cs file", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Forms/Main.Designer.cs",
					old_string: "var a = 1;",
					new_string: "var a = 1; // generated",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows a comment in a file under obj/", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Api/obj/Debug/Api.AssemblyInfo.cs",
					old_string: "var a = 1;",
					new_string: "var a = 1; // generated",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows a Write whose header marks the file auto-generated", () => {
			const decision = decideCommentGuard(
				input("Write", {
					file_path: "src/Program.cs",
					content: "// <auto-generated />\n// tool output\nvar a = 1;",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("still blocks a comment in a hand-written .cs file", () => {
			const decision = decideCommentGuard(
				input("Write", {
					file_path: "src/Program.cs",
					content: "// a note\nvar a = 1;",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows a ReSharper disable directive", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Program.cs",
					old_string: "var a = 1;",
					new_string:
						"// ReSharper disable once UnusedMember.Local\nvar a = 1;",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows a ReSharper restore directive", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Program.cs",
					old_string: "var a = 1;",
					new_string: "var a = 1;\n// ReSharper restore UnusedMember.Local",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows a noinspection directive", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Program.cs",
					old_string: "var a = 1;",
					new_string: "// noinspection CSharpUnusedLocal\nvar a = 1;",
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows preprocessor directives", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Program.cs",
					old_string: "var a = 1;",
					new_string:
						"#region Setup\n#pragma warning disable\n#nullable enable\nvar a = 1;",
				}),
			);

			expect(decision).toBeUndefined();
		});
	});

	describe("razor", () => {
		it("blocks introducing a razor comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Pages/Counter.razor",
					old_string: "<p>@count</p>",
					new_string: "@* the running total *@\n<p>@count</p>",
				}),
			);

			expect(decision).toBeDefined();
			expect(decision).toContain("(//)");
		});

		it("blocks introducing an html comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Pages/Counter.razor",
					old_string: "<p>@count</p>",
					new_string: "<!-- the running total -->\n<p>@count</p>",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("blocks introducing a comment in a .cshtml view", () => {
			const decision = decideCommentGuard(
				input("Write", {
					file_path: "Views/Home/Index.cshtml",
					content: "@* the landing page *@\n<h1>Home</h1>",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows an html comment marker inside an attribute value", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Pages/Counter.razor",
					old_string: "<div>x</div>",
					new_string: '<div title="<!-- not a comment -->">x</div>',
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows comment markers inside a csharp string in a code block", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Pages/Counter.razor",
					old_string: "@code {\n}",
					new_string: '@code {\n\tprivate string M = "@* x *@ <!-- y -->";\n}',
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("allows markup with no comments", () => {
			const decision = decideCommentGuard(
				input("Write", {
					file_path: "src/Pages/Counter.razor",
					content: '@page "/counter"\n<h1>Counter</h1>\n<p>@currentCount</p>',
				}),
			);

			expect(decision).toBeUndefined();
		});

		it("ignores an unchanged razor comment", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/Pages/Counter.razor",
					old_string: "@* keep *@\n<p>@count</p>",
					new_string: "@* keep *@\n<p>@count + 1</p>",
				}),
			);

			expect(decision).toBeUndefined();
		});
	});

	describe("rust", () => {
		it.each([
			["//", "let a = 1; // bump"],
			["/* */", "/* bump */ let a = 1;"],
			["///", "/// Bumps it.\nlet a = 1;"],
			["//!", "//! Crate docs.\nlet a = 1;"],
		])("blocks introducing a %s comment", (_, new_string) => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/main.rs",
					old_string: "let a = 1;",
					new_string,
				}),
			);

			expect(decision).toContain("assist code-comment set");
		});

		it("blocks a comment in a written .rs file", () => {
			const decision = decideCommentGuard(
				input("Write", {
					file_path: "src/lib.rs",
					content: "fn run() {}\n// explain\n",
				}),
			);

			expect(decision).toBeDefined();
		});

		it("allows comment markers inside rust string literals", () => {
			const decision = decideCommentGuard(
				input("Edit", {
					file_path: "src/main.rs",
					old_string: 'let a = "x";',
					new_string:
						'let a = "https://x";\nlet b = r#"/* "// y" */"#;\nlet c = r"//";',
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
