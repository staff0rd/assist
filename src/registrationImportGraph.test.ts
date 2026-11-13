import { builtinModules } from "node:module";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { collectStaticImportGraph } from "./test/collectStaticImportGraph";
import { findEagerActionReferences } from "./test/findEagerActionReferences";

const graph = collectStaticImportGraph(path.join(__dirname, "runCli.ts"));
const relative = (file: string) => path.relative(__dirname, file);
const isRegisterFile = (file: string) =>
	/^register[A-Z]\w*\.ts$/.test(path.basename(file));

describe("CLI registration import graph", () => {
	it("reaches no external package other than commander", () => {
		const packages = [...graph.packages.keys()].filter(
			(name) => name !== "commander" && !builtinModules.includes(name),
		);
		expect(packages).toEqual([]);
	});

	it("does not statically import any lazily loaded command module", () => {
		const eager = [...graph.lazyTargets.keys()]
			.filter((target) => graph.modules.has(target))
			.map(relative);
		expect(eager).toEqual([]);
	});

	it("loads every action's implementation lazily", () => {
		const eager = [...graph.modules]
			.filter(isRegisterFile)
			.flatMap((file) =>
				findEagerActionReferences(file).map(
					(name) => `${relative(file)}: ${name}`,
				),
			);
		expect(eager).toEqual([]);
	});
});
