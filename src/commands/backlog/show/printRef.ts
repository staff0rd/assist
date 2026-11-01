import chalk from "chalk";
import { refLabel } from "../refLabel";
import type { GitRef } from "../types";

export function printRef(ref: GitRef): void {
	const url = ref.url ? ` ${chalk.dim(ref.url)}` : "";
	const approvedAt =
		isUnlock(ref) && ref.createdAt ? ` ${chalk.dim(ref.createdAt)}` : "";
	console.log(`  ${chalk.cyan(ref.kind)} ${refLabel(ref)}${url}${approvedAt}`);
}

function isUnlock(ref: GitRef): boolean {
	return ref.kind === "docs-unlock" || ref.kind === "schema-unlock";
}
