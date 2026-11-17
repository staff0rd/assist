export function skipComment(src: string, i: number): number {
	if (src[i] !== "/") return i;
	if (src[i + 1] === "/") {
		const end = src.indexOf("\n", i);
		return end === -1 ? src.length : end;
	}
	if (src[i + 1] === "*") {
		const end = src.indexOf("*/", i + 2);
		return end === -1 ? -1 : end + 2;
	}
	return i;
}
