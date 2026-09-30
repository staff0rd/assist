export function compareBoardOrder(a: number[], b: number[]): number {
	for (let index = 0; index < Math.min(a.length, b.length); index++)
		if (a[index] !== b[index]) return a[index] - b[index];
	return a.length - b.length;
}
