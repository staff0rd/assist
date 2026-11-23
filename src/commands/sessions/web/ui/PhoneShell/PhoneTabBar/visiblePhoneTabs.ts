import { phoneTabs } from "./phoneTabs";

export function visiblePhoneTabs(autopilotConfigured: boolean) {
	return phoneTabs.filter(
		({ path }) => path !== "/autopilot" || autopilotConfigured,
	);
}
