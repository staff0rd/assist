import { fileURLToPath } from "node:url";
import { docsPaths } from "../docsPaths";
import { applyBlockDiff, type DiffVisitorContext } from "./applyBlockDiff";
import { declaredScreenshots } from "./declaredScreenshots";
import { diffBlocks } from "./diffBlocks";
import { readHeadSource } from "./readHeadSource";
import { diffHtml, docsDiffClasses } from "./renderDiffBlock";
import { type MdastNode, toDiffBlocks } from "./toDiffBlocks";

type PluginContext = {
	fileURL: URL | undefined;
	data: { astro?: { frontmatter?: { screenshots?: unknown } } };
};

export function docsDiffPlugin(parseMarkdown: (source: string) => unknown) {
	return ({ fileURL, data }: PluginContext) => {
		const path = fileURL && fileURLToPath(fileURL);
		if (!path?.startsWith(docsPaths.pagesDir)) return undefined;
		const declared = new Set(declaredScreenshots(data).keys());
		return {
			name: "assist-docs-diff",
			options: { position: true },
			after(root: MdastNode, ctx: DiffVisitorContext) {
				const head = readHeadSource(path);
				if (head === undefined) {
					ctx.prependChild(root, [
						diffHtml(`<p class="${docsDiffClasses.newPage}">New page</p>`),
					]);
					return;
				}
				const diff = diffBlocks(
					toDiffBlocks(parseMarkdown(head) as MdastNode, head),
					toDiffBlocks(root, ctx.source),
				);
				applyBlockDiff(root, diff, declared, ctx);
			},
		};
	};
}
