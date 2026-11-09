import type { CaptureTestflight } from "../captureSetupStepSchema";
import { teamResources } from "./teamResources";
import { groupResources } from "./groupResources";

const APP_ID = "app";
const groupIds = { internal: "group-internal", external: "group-external" };

type AscResource = {
	type: string;
	id: string;
	attributes: Record<string, unknown>;
};

function testerResources(
	testflight: CaptureTestflight,
	groupId: string | null,
): AscResource[] {
	return testflight.testers
		.filter((tester) => groupIds[tester.group] === groupId)
		.map((tester) => ({
			type: "betaTesters",
			id: tester.email,
			attributes: { email: tester.email, state: tester.state },
		}));
}

export function fakeAppStoreConnectData(
	testflight: CaptureTestflight,
	url: URL,
): AscResource[] | undefined {
	switch (url.pathname) {
		case "/v1/apps":
			return [
				{
					type: "apps",
					id: APP_ID,
					attributes: { bundleId: testflight.bundleId },
				},
			];
		case `/v1/apps/${APP_ID}/betaGroups`:
			return groupResources(testflight);
		case "/v1/betaTesters":
			return testerResources(
				testflight,
				url.searchParams.get("filter[betaGroups]"),
			);
		case "/v1/users":
			return teamResources(testflight, false);
		case "/v1/userInvitations":
			return teamResources(testflight, true);
		default:
			return undefined;
	}
}
