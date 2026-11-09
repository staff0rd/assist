import { harnessKinds } from "./harnessKinds";
import { prActions } from "./prActions";
import { type ReviewButtonMode, reviewButtonModes } from "./reviewButtonModes";
import { reviewOptionArgs, reviewOptionFlags } from "./reviewOptionFlags";

function sameArgs(a: readonly string[], b: readonly string[]): boolean {
	return a.length === b.length && a.every((arg, index) => arg === b[index]);
}

function isOptionFlags(flags: string[]): boolean {
	const options = Object.fromEntries(
		reviewOptionFlags.map(({ key, flag }) => [key, flags.includes(flag)]),
	) as Parameters<typeof reviewOptionArgs>[0];
	return sameArgs(flags, reviewOptionArgs(options));
}

function withoutHarness(
	mode: ReviewButtonMode,
	rest: string[],
): string[] | undefined {
	if (rest[0] !== "--harness") return rest;
	if (!mode.featureId) return undefined;
	return (harnessKinds as readonly string[]).includes(rest[1])
		? rest.slice(2)
		: undefined;
}

export function isAllowedPrArgs(args: unknown): args is string[] {
	if (!Array.isArray(args)) return false;
	if (prActions.some((action) => sameArgs(action.args, args))) return true;
	return reviewButtonModes.some((mode) => {
		if (!sameArgs(mode.args, args.slice(0, mode.args.length))) return false;
		const flags = withoutHarness(mode, args.slice(mode.args.length));
		return flags !== undefined && isOptionFlags(flags);
	});
}
