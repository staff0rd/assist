export function countHunkLines(text: string, prefix: "+" | "-"): number {
	return text.split("\n").filter((line) => line.startsWith(prefix)).length;
}
