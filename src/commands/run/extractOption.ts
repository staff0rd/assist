export function extractOption(
	args: string[],
	flag: string,
): { value: string | undefined; remaining: string[] } {
	const index = args.indexOf(flag);
	if (index === -1) return { value: undefined, remaining: args };
	return {
		value: args[index + 1],
		remaining: [...args.slice(0, index), ...args.slice(index + 2)],
	};
}
