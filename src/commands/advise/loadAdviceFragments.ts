import { readdirSync, readFileSync } from "node:fs";
import { basename, join } from "node:path";
import { adviceDir } from "./adviceDir";
import {
	type AdviceFragment,
	parseAdviceFragment,
} from "./parseAdviceFragment";

export function loadAdviceFragments(
	dir: string = adviceDir(),
): AdviceFragment[] {
	return readdirSync(dir)
		.filter((file) => file.endsWith(".md"))
		.sort()
		.map((file) =>
			parseAdviceFragment(
				basename(file, ".md"),
				readFileSync(join(dir, file), "utf8"),
			),
		);
}
