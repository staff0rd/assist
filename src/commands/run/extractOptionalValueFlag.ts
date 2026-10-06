export function extractOptionalValueFlag(
	args: string[],
	flag: string,
): { value: true | string | undefined; remaining: string[] } {
	const index = args.indexOf(flag);
	if (index === -1) return { value: undefined, remaining: args };
	const next = args[index + 1];
	const hasValue = next !== undefined && !next.startsWith("-");
	return {
		value: hasValue ? next : true,
		remaining: [
			...args.slice(0, index),
			...args.slice(index + (hasValue ? 2 : 1)),
		],
	};
}
