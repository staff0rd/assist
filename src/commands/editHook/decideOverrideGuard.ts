import { MAINTAINABILITY_OVERRIDE_MARKER } from "../complexity/maintainability/parseMaintainabilityOverride";

export type EditHookInput = {
	tool_name: string;
	tool_input: {
		file_path?: string;
		old_string?: string;
		new_string?: string;
		content?: string;
		edits?: { old_string?: string; new_string?: string }[];
	};
};

const DENY_REASON = `Edits touching the '${MAINTAINABILITY_OVERRIDE_MARKER}' marker are blocked. This marker is a human-managed maintainability gate exception — an agent may not add, change, or remove it. If a file genuinely needs a different threshold, raise it with a human.`;

function candidateStrings(
	input: EditHookInput,
	existingContent: string | undefined,
): string[] {
	const { tool_name, tool_input } = input;
	switch (tool_name) {
		case "Edit":
			return [tool_input.old_string, tool_input.new_string].filter(
				(s): s is string => s !== undefined,
			);
		case "MultiEdit":
			return (tool_input.edits ?? []).flatMap((e) =>
				[e.old_string, e.new_string].filter(
					(s): s is string => s !== undefined,
				),
			);
		case "Write":
			return [tool_input.content, existingContent].filter(
				(s): s is string => s !== undefined,
			);
		default:
			return [];
	}
}

export function decideOverrideGuard(
	input: EditHookInput,
	existingContent?: string,
): string | undefined {
	const touchesMarker = candidateStrings(input, existingContent).some((s) =>
		s.includes(MAINTAINABILITY_OVERRIDE_MARKER),
	);
	return touchesMarker ? DENY_REASON : undefined;
}
