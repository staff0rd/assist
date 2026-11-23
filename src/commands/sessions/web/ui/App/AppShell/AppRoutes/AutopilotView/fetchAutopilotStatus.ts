import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import type { AutopilotItemView } from "../../../../../autopilot/AutopilotItemView";
import { apiFetch } from "../../../../apiFetch";
import { withNode } from "../../../../withNode";

export type AutopilotFetchResult = {
	status: AutopilotStatus | null;
	items: AutopilotItemView[];
	error?: string;
};

export async function fetchAutopilotStatus(
	cwd: string,
	node?: string,
): Promise<AutopilotFetchResult> {
	try {
		const res = await apiFetch(
			withNode(`/api/autopilot/status?cwd=${encodeURIComponent(cwd)}`, node),
		);
		const body = await res.json().catch(() => ({}));
		if (!res.ok)
			return {
				status: null,
				items: [],
				error: `Couldn't read the schedule: ${body.error ?? `HTTP ${res.status}`}`,
			};
		return { status: body.status ?? null, items: body.items ?? [] };
	} catch (error) {
		return {
			status: null,
			items: [],
			error: `Couldn't read the schedule: ${String(error)}`,
		};
	}
}
