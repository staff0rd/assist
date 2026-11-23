type Option = { label: string; description: string };

const RECOMMENDED = /\(recommended\)/i;

export function findRecommendedOption<T extends Option>(
	options: T[],
): T | undefined {
	return (
		options.find((o) => RECOMMENDED.test(o.label)) ??
		options.find((o) => RECOMMENDED.test(o.description))
	);
}
