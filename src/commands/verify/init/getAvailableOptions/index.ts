import {
	type ExistingSetup,
	getStatusLabel,
	needsSetup,
} from "../detectExistingSetup";
import { type OptionDef, options } from "./options";

type VerifyOption = {
	name: string;
	value: string;
	description: string;
};

function resolveDescription(
	desc: string | ((setup: ExistingSetup) => string),
	setup: ExistingSetup,
): string {
	return typeof desc === "function" ? desc(setup) : desc;
}

function toVerifyOption(def: OptionDef, setup: ExistingSetup): VerifyOption {
	return {
		name: `${def.label}${getStatusLabel(setup[def.toolKey])}`,
		value: def.value,
		description: resolveDescription(def.description, setup),
	};
}

export function getAvailableOptions(setup: ExistingSetup): VerifyOption[] {
	return options
		.filter(
			(def) =>
				needsSetup(setup[def.toolKey]) && (def.extraCondition?.(setup) ?? true),
		)
		.map((def) => toVerifyOption(def, setup));
}
