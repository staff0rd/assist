import { withoutHarnessArg } from "../withoutHarnessArg";
import { azureDevopsPrActions } from "./azureDevopsPrActions";

export function isAllowedAzureDevopsPrArgs(args: unknown): args is string[] {
	if (!Array.isArray(args)) return false;
	return azureDevopsPrActions.some(
		(action) =>
			action.args.every((arg, index) => arg === args[index]) &&
			withoutHarnessArg(action, args.slice(action.args.length))?.length === 0,
	);
}
