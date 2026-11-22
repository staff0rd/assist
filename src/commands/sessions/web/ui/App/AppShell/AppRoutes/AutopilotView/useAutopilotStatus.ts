import { useCallback, useEffect, useState } from "react";
import type { AutopilotStatus } from "../../../../../../daemon/autopilot/AutopilotStatus";
import { apiFetch } from "../../../../apiFetch";
import { useApiNode } from "../../../../useApiNode";
import { withNode } from "../../../../withNode";

const POLL_MS = 15_000;

type AutopilotStatusState =
	| { loading: true }
	| { loading: false; status: AutopilotStatus | null; error?: string };

async function fetchStatus(
	cwd: string,
	node?: string,
): Promise<AutopilotStatusState> {
	try {
		const res = await apiFetch(
			withNode(`/api/autopilot/status?cwd=${encodeURIComponent(cwd)}`, node),
		);
		const body = await res.json().catch(() => ({}));
		if (!res.ok)
			return {
				loading: false,
				status: null,
				error: `Couldn't read the schedule: ${body.error ?? `HTTP ${res.status}`}`,
			};
		return { loading: false, status: body.status ?? null };
	} catch (error) {
		return {
			loading: false,
			status: null,
			error: `Couldn't read the schedule: ${String(error)}`,
		};
	}
}

export function useAutopilotStatus(cwd: string) {
	const node = useApiNode();
	const [state, setState] = useState<AutopilotStatusState>({ loading: true });

	const refresh = useCallback(async () => {
		if (!cwd) return;
		setState(await fetchStatus(cwd, node));
	}, [cwd, node]);

	useEffect(() => {
		void refresh();
		const timer = setInterval(() => void refresh(), POLL_MS);
		return () => clearInterval(timer);
	}, [refresh]);

	return { state, refresh, node };
}
