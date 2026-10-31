import { updateState } from "../../App/AppShell/AppRoutes/UpdatesView/updateState";
import { isUpdateReady } from "../../App/AppShell/isUpdateReady";
import type { NodeUpdateEntry } from "../../App/AppShell/NodeUpdateEntry";
import type { NodeDotTone } from "../../HomeNodeGate/NodeDot";
import { compareVersions } from "../PhoneNodesSheet/compareVersions";

type PhoneUpdateState = {
	tone: NodeDotTone;
	detail: string;
	updateAvailable: boolean;
	restartPending: boolean;
};

const kindTone = {
	ok: "ok",
	ready: "warn",
	diverged: "warn",
	retrying: "warn",
	paused: "off",
	off: "off",
	loading: "off",
	unavailable: "error",
} as const;

export function phoneUpdateState(
	entry: NodeUpdateEntry,
	latest: string | undefined,
): PhoneUpdateState {
	const state = updateState(entry);
	const { status } = entry;
	const updateAvailable =
		!!status && !!latest && compareVersions(latest, status.built) > 0;
	const restartPending = isUpdateReady(entry);
	const version =
		status &&
		(status.running === status.built
			? `v${status.running}`
			: `v${status.running} → v${status.built}`);
	const label = updateAvailable
		? `v${latest} available`
		: restartPending
			? "restart pending"
			: state.label.toLowerCase();
	return {
		tone: updateAvailable ? "warn" : kindTone[state.kind],
		detail: [version, label].filter(Boolean).join(" · "),
		updateAvailable,
		restartPending,
	};
}
