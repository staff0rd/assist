export function skipSpace(src: string, i: number): number {
	while (i < src.length && /\s/.test(src[i])) i++;
	return i;
}
