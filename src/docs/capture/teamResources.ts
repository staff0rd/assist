import type { CaptureTestflight } from "../captureSetupStepSchema";

type AscResource = {
	type: string;
	id: string;
	attributes: Record<string, unknown>;
};

export function teamResources(
	testflight: CaptureTestflight,
	pending: boolean,
): AscResource[] {
	const type = pending ? "userInvitations" : "users";
	const emailAttribute = pending ? "email" : "username";
	return (testflight.team ?? [])
		.filter((member) => Boolean(member.pending) === pending)
		.map((member) => ({
			type,
			id: member.email,
			attributes: { [emailAttribute]: member.email, allAppsVisible: true },
		}));
}
