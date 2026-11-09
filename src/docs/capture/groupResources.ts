import type { CaptureTestflight } from "../captureSetupStepSchema";

type AscResource = {
	type: string;
	id: string;
	attributes: Record<string, unknown>;
};

const groupIds = { internal: "group-internal", external: "group-external" };

export function groupResources(testflight: CaptureTestflight): AscResource[] {
	const groups = [
		{ id: groupIds.external, name: testflight.externalGroup, internal: false },
	];
	if (testflight.internalGroup)
		groups.push({
			id: groupIds.internal,
			name: testflight.internalGroup,
			internal: true,
		});
	return groups.map((group) => ({
		type: "betaGroups",
		id: group.id,
		attributes: { name: group.name, isInternalGroup: group.internal },
	}));
}
