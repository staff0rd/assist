import type { AdviceContext } from "./AdviceContext";
import type { AdviceFragment } from "./parseAdviceFragment";
import { verifyRunCommandNames } from "./verifyRunCommandNames";

const adviceVariables: Record<string, (context: AdviceContext) => string> = {
	verifyCommands: (context) =>
		verifyRunCommandNames(context)
			.map((name) => `\`${name}\``)
			.join(", "),
};

const adviceOverrides: Record<
	string,
	(context: AdviceContext) => string | undefined
> = {
	verify: ({ config }) => config.advice?.verify,
};

export function renderAdviceBody(
	fragment: AdviceFragment,
	context: AdviceContext,
): string {
	const override = adviceOverrides[fragment.name]?.(context);
	if (override !== undefined) return override.trim();

	return fragment.body.replace(/\{\{(\w+)\}\}/g, (_, name: string) => {
		const variable = adviceVariables[name];
		if (!variable)
			throw new Error(
				`Advice fragment ${fragment.name} uses unknown variable "${name}"`,
			);
		return variable(context);
	});
}
