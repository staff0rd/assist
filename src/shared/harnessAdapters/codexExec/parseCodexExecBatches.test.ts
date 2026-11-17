import { describe, expect, it } from "vitest";
import { parseCodexExecWrapper } from "./parseCodexExecWrapper";

const exec = (cmd: string) =>
	`tools.exec_command({cmd:${JSON.stringify(cmd)},"max_output_tokens":1000})`;
const poll = (session: number) =>
	`tools.write_stdin({session_id:${session},chars:""})`;

function summarise(input: string) {
	return parseCodexExecWrapper(input)?.map((part) =>
		part.kind === "raw"
			? { raw: part.source }
			: `${part.call.tool}:${part.call.args.cmd ?? part.call.args.session_id}`,
	);
}

describe("parseCodexExecWrapper batches", () => {
	it.each([
		[
			"sequential text(await)",
			`text(await ${exec("cat a")});\ntext(await ${exec("cat b")});\ntext(await ${exec("cat c")});\n`,
		],
		[
			"same line, no spaces",
			`text(await ${exec("cat a")});text(await ${exec("cat b")});text(await ${exec("cat c")})`,
		],
		[
			"output props",
			`text( (await ${exec("cat a")}).output); text((await ${exec("cat b")})); text((await ${exec("cat c")}).output);`,
		],
		[
			"bindings without semicolons",
			`const r=await ${exec("cat a")}\ntext(r.output)\nconst s = await ${exec("cat b")}\ntext(JSON.stringify(s))\ntext(await ${exec("cat c")})`,
		],
		[
			"Promise.allSettled with forEach(text)",
			`const results = await Promise.allSettled([\n${exec("cat a")},\n${exec("cat b")},\n${exec("cat c")}\n]); results.forEach(text);\n`,
		],
		[
			"Promise.all destructured",
			`const [a, b, c] = await Promise.all([${exec("cat a")}, ${exec("cat b")}, ${exec("cat c")},]);\ntext(a.output); text(b.output); text(c.output);`,
		],
		[
			"forEach with an arrow body",
			`const rs=await Promise.allSettled([${exec("cat a")},${exec("cat b")},${exec("cat c")}]);rs.forEach((r,i)=>text({i,result:r}));`,
		],
		[
			"for...of over the awaited batch",
			`for (const r of await Promise.allSettled([\n${exec("cat a")},\n${exec("cat b")},\n${exec("cat c")}\n]))text(r);`,
		],
		[
			"for...of over a binding with a block body",
			`const results=await Promise.allSettled([${exec("cat a")},${exec("cat b")},${exec("cat c")}]);\nfor (const r of results) {\n  text(r.value.output);\n}`,
		],
		[
			"index loop over a binding",
			`const rs=await Promise.allSettled([${exec("cat a")},${exec("cat b")},${exec("cat c")}]);\nfor (let i=0;i<rs.length;i++) text({i,...rs[i]});`,
		],
		[
			"pragma and comments",
			`// @exec: {"yield_time_ms": 1000}\n// read the files\ntext(await ${exec("cat a")}); /* next */\ntext(await ${exec("cat b")});\ntext(await ${exec("cat c")});`,
		],
		[
			"awaited multiline continuation",
			`const r = await\n  ${exec("cat a")};\ntext(r.output);\nconst [b, c] = await Promise.all([${exec("cat b")}, ${exec("cat c")}]);\ntext(b);\ntext(c);`,
		],
	])(
		"gives each call of a %s batch its own part in source order",
		(_, input) => {
			expect(summarise(input)).toEqual([
				"exec_command:cat a",
				"exec_command:cat b",
				"exec_command:cat c",
			]);
		},
	);

	it("keeps write_stdin and exec_command calls in source order", () => {
		expect(
			summarise(
				`text(await ${poll(24345)}); text(await ${exec("git status")});`,
			),
		).toEqual(["write_stdin:24345", "exec_command:git status"]);
	});

	it("reads string escapes and multiline templates in each batched call exactly", () => {
		const script = "python3 - <<'PY'\nprint(\"a;b\")\nprint('}')\nPY";
		const input = `text(await tools.exec_command({cmd:\`${script}\`}));\ntext(await tools.exec_command({cmd:'echo \\'x\\'; echo "\\u0041"\\n'}));`;
		expect(summarise(input)).toEqual([
			`exec_command:${script}`,
			"exec_command:echo 'x'; echo \"A\"\n",
		]);
	});

	it("keeps an unrecognised statement between calls as raw source in place", () => {
		const store =
			'store("a667baseline",JSON.parse(p.output));text({baselineLoaded:true});';
		const input = `const p=await ${exec("cat a")};\n${store}\ntext(await ${exec("cat b")});\n`;
		expect(summarise(input)).toEqual([
			"exec_command:cat a",
			{ raw: store },
			"exec_command:cat b",
		]);
	});

	it("keeps other tools and their glue as raw parts", () => {
		const patch = String.raw`text(await tools.apply_patch("*** Begin Patch\n*** End Patch"));`;
		expect(summarise(`${patch}\ntext(await ${exec("cat a")});`)).toEqual([
			{ raw: patch },
			"exec_command:cat a",
		]);
	});

	it("keeps an unrecognised loop over a recognised batch as raw", () => {
		const loop =
			"for(let i=0;i<rs.length;i++)text({command:i+1,result:rs[i]});";
		expect(
			summarise(
				`const rs=await Promise.allSettled([${exec("cat a")},${exec("cat b")}]);${loop}`,
			),
		).toEqual(["exec_command:cat a", "exec_command:cat b", { raw: loop }]);
	});

	it("keeps a batch whose loop body does more than print as one raw part", () => {
		const input = `for(const r of await Promise.allSettled([${exec("cat a")},${exec("cat b")}])){if(r.status==="fulfilled")store("x",r.value.output);}\ntext(await ${exec("cat c")});`;
		expect(summarise(input)).toEqual([
			{ raw: input.split("\n")[0] },
			"exec_command:cat c",
		]);
	});

	it("merges consecutive unrecognised statements, including glue between them", () => {
		const middle = "const item=load('a');\ntext(item);\nsave(item);";
		expect(
			summarise(
				`text(await ${exec("cat a")});\n${middle}\ntext(await ${exec("cat b")});`,
			),
		).toEqual(["exec_command:cat a", { raw: middle }, "exec_command:cat b"]);
	});

	it("keeps a batch with a dynamic item or extra Promise wrapping as raw", () => {
		const dynamic = `const r=await Promise.all([${exec("cat a")}, tools.exec_command(args)]);`;
		expect(summarise(`${dynamic}\ntext(await ${exec("cat b")});`)).toEqual([
			{ raw: dynamic },
			"exec_command:cat b",
		]);
		const chained = `const r=await Promise.all([${exec("cat a")}.then(x=>x.output)]);`;
		expect(summarise(`${chained}\ntext(await ${exec("cat b")});`)).toEqual([
			{ raw: chained },
			"exec_command:cat b",
		]);
	});

	it("does not treat glue that prints unbound or computed values as harmless", () => {
		const glue = String.raw`text(rs.map(r=>r.output).join('\n'));`;
		expect(
			summarise(`const rs=await Promise.all([${exec("cat a")}]);${glue}`),
		).toEqual(["exec_command:cat a", { raw: glue }]);
		expect(summarise(`text(await ${exec("cat a")});text(other);`)).toEqual([
			"exec_command:cat a",
			{ raw: "text(other);" },
		]);
	});

	it("keeps a malformed later call (missing paren) as raw rather than inventing arguments", () => {
		const broken = `text(await ${exec("cat b")};\nconst p=await b.newPage();`;
		expect(
			summarise(`text(await ${exec("cat a")});\n${broken}`),
		).toBeUndefined();
	});
});
