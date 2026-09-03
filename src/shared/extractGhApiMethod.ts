export function extractGhApiMethod(args: string[]): string | undefined {
	for (let i = 0; i < args.length; i++) {
		const arg = args[i];
		if (arg.startsWith("--method=")) return arg.slice("--method=".length);
		if (arg.startsWith("-X=")) return arg.slice("-X=".length);
		if (arg.startsWith("-X") && arg.length > 2) return arg.slice(2);
		if ((arg === "--method" || arg === "-X") && i + 1 < args.length) {
			return args[i + 1];
		}
	}
	return undefined;
}
