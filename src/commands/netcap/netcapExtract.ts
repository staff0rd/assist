import { writeFileSync } from "node:fs";
import { join } from "node:path";
import chalk from "chalk";
import { defaultCapturePath } from "./defaultCapturePath";
import { extractPostsFromCapture } from "./extractPostsFromCapture";

export function netcapExtract(file: string | undefined): void {
	const captureFile = file ?? defaultCapturePath();
	const posts = extractPostsFromCapture(captureFile);
	const outFile = join(captureFile, "..", "posts.json");
	writeFileSync(outFile, `${JSON.stringify(posts, null, 2)}\n`);
	console.log(
		chalk.green(`extracted ${posts.length} posts`),
		chalk.dim(`-> ${outFile}`),
	);
}
