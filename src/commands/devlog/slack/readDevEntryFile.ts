import { readFileSync } from "node:fs";
import { parse as parseYaml } from "yaml";

type DevEntryItem = { text: string };

export type DevEntryFile = {
	project?: string;
	week?: string;
	title?: string;
	dates?: { first?: string; last?: string };
	versions?: { first?: string; last?: string };
	added?: DevEntryItem[];
	changed?: DevEntryItem[];
	fixed?: DevEntryItem[];
	slack?: string;
	lede: string;
};

const FRONTMATTER = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/;

export function readDevEntryFile(path: string): DevEntryFile | null {
	let contents: string;
	try {
		contents = readFileSync(path, "utf8");
	} catch {
		return null;
	}
	const match = contents.match(FRONTMATTER);
	if (!match) return null;
	const frontmatter = (parseYaml(match[1]) ?? {}) as Omit<DevEntryFile, "lede">;
	return { ...frontmatter, lede: match[2].trim() };
}
