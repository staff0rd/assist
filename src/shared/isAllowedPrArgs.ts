import { prActions } from "./prActions";
import { reviewButtonModes } from "./reviewButtonModes";
import { reviewOptionArgs, reviewOptionFlags } from "./reviewOptionFlags";
import { withoutHarnessArg } from "./withoutHarnessArg";

function sameArgs(a: readonly string[], b: readonly string[]): boolean {
	return a.length === b.length && a.every((arg, index) => arg === b[index]);
}

function isOptionFlags(flags: string[]): boolean {
	const options = Object.fromEntries(
		reviewOptionFlags.map(({ key, flag }) => [key, flags.includes(flag)]),
	) as Parameters<typeof reviewOptionArgs>[0];
	return sameArgs(flags, reviewOptionArgs(options));
}

export function isAllowedPrArgs(args: unknown): args is string[] {
	if (!Array.isArray(args)) return false;
	const isAction = prActions.some(
		(action) =>
			sameArgs(action.args, args.slice(0, action.args.length)) &&
			withoutHarnessArg(action, args.slice(action.args.length))?.length === 0,
	);
	if (isAction) return true;
	return reviewButtonModes.some((mode) => {
		if (!sameArgs(mode.args, args.slice(0, mode.args.length))) return false;
		const flags = withoutHarnessArg(mode, args.slice(mode.args.length));
		return flags !== undefined && isOptionFlags(flags);
	});
}
