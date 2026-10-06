import type { MiroExtractConfig } from "../../shared/types";
import { promptConfirm } from "../../shared/promptConfirm";
import { promptInput } from "../../shared/promptInput";
import { saveMiroExtract } from "./saveMiroExtract";
import type { MiroExtractOptions, MiroExtractPaths } from "./types";

async function extractName(
	options: MiroExtractOptions,
): Promise<string | undefined> {
	if (options.save) return options.save;
	if (!process.stdin.isTTY) return undefined;
	if (!(await promptConfirm("Save this selection as a named extract?", false)))
		return undefined;
	const name = (await promptInput("name", "Extract name")).trim();
	return name === "" ? undefined : name;
}

export async function offerSaveExtract(
	extract: MiroExtractConfig,
	options: MiroExtractOptions,
	paths: MiroExtractPaths = {},
): Promise<void> {
	const name = await extractName(options);
	if (!name) return;
	const target = await saveMiroExtract(name, extract, options, paths);
	console.log(`Saved extract "${name}" to ${target}`);
}
