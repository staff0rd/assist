import { useState } from "react";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { launchBuild } from "./launchBuild";
import type { useStartTarget } from "./useStartTarget";

export function useBuildLaunch(
	itemId: number,
	target: ReturnType<typeof useStartTarget>,
) {
	const { launchAssist } = useSessionLaunchContext();
	const [launched, setLaunched] = useState(false);
	const unavailableOn = target.kind === "unavailable" ? target.node : undefined;
	const disabled = launched || !!unavailableOn;
	const launch = (harnessArgs: string[]) => {
		if (disabled || target.kind !== "ready") return;
		setLaunched(true);
		launchBuild(launchAssist, itemId, target, harnessArgs);
	};
	return { unavailableOn, disabled, launch };
}
