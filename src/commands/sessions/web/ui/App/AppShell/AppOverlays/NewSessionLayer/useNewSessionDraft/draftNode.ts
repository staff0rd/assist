import type { NodeSelection } from "../../../../../useNodeSelection";

export function draftNode(
	picked: string | undefined,
	{ visible, names, selected }: NodeSelection,
): string | undefined {
	if (!visible) return undefined;
	return picked && names.includes(picked) ? picked : selected;
}
