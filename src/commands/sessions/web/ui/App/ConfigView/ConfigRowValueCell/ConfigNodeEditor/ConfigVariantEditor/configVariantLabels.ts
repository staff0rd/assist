import type { ConfigObjectNode } from "../../../../../../../../../shared/ConfigNode";
import { configNodeFieldName } from "../../../../../../../../../shared/configNodeFieldName";

function requiredNames(variant: ConfigObjectNode): string[] {
	return variant.fields
		.filter((field) => !field.optional)
		.map(configNodeFieldName)
		.filter((name): name is string => name !== undefined);
}

function declares(variant: ConfigObjectNode, name: string): boolean {
	return variant.fields.some((field) => configNodeFieldName(field) === name);
}

export function configVariantLabels(variants: ConfigObjectNode[]): string[] {
	return variants.map((variant, index) => {
		const others = variants.filter((_variant, at) => at !== index);
		const unique = requiredNames(variant).filter(
			(name) => !others.some((other) => declares(other, name)),
		);
		return unique.length > 0 ? unique.join(" + ") : `option ${index + 1}`;
	});
}
