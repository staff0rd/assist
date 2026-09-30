export const sameLogin = (a: string | undefined, b: string) =>
	a?.toLowerCase() === b.toLowerCase();
