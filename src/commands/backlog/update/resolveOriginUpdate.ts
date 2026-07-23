import chalk from "chalk";
import { formatItemId } from "../formatItemId";
import { normalizeOrigin } from "../getCurrentOrigin";
import { getOrigin } from "../shared";

type OriginResolution =
	| { kind: "none" }
	| { kind: "noop" }
	| { kind: "set"; origin: string };

export function resolveOriginUpdate(
	optionOrigin: string | boolean | undefined,
	item: { id: number; origin?: string },
): OriginResolution {
	if (optionOrigin === undefined || optionOrigin === false)
		return { kind: "none" };

	const origin =
		typeof optionOrigin === "string"
			? normalizeOrigin(optionOrigin)
			: getOrigin();
	if (origin === item.origin) {
		console.log(
			chalk.yellow(
				`Item ${formatItemId(item.id)} is already on origin "${origin}"; nothing to change.`,
			),
		);
		return { kind: "noop" };
	}

	return { kind: "set", origin };
}
