import type { HighLevelTestExcerpt } from "../../../../../../../../../../review/highLevel/types";

function hunk({ source, line }: HighLevelTestExcerpt, removed: boolean) {
	const lines = source.split("\n");
	const range = `${line},${lines.length}`;
	if (removed)
		return [
			`@@ -${range} +${Math.max(line - 1, 0)},0 @@`,
			...lines.map((text) => `-${text}`),
		];
	return [`@@ -${range} +${range} @@`, ...lines.map((text) => ` ${text}`)];
}

export function testSourcePatch(
	excerpts: HighLevelTestExcerpt[],
	removed = false,
): string {
	return excerpts.flatMap((excerpt) => hunk(excerpt, removed)).join("\n");
}
