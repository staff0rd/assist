import { useState } from "react";
import { useLiveSessionsContext } from "../../../../sessions/web/ui/useLiveSessionsContext";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { BuildSplitButton } from "./BuildSplitButton";
import { CloneOnNodeButton } from "./CloneOnNodeButton";
import { launchBuild } from "./launchBuild";
import { PlayButton } from "./PlayButton";
import { runInFlightSession } from "./runInFlightSession";
import { useStartTarget } from "./useStartTarget";
import { playTooltip } from "./playTooltip";

export function PlayAction({
	itemId,
	compact = false,
}: {
	itemId: number;
	compact?: boolean;
}) {
	const { launchAssist } = useSessionLaunchContext();
	const target = useStartTarget();
	const inFlight = runInFlightSession(useLiveSessionsContext(), itemId);
	// Latch on first click so a double-click can't spawn two sessions before
	// the list refresh flips the item out of the playable state.
	const [launched, setLaunched] = useState(false);
	if (target.kind === "clone")
		return <CloneOnNodeButton target={target.prompt} />;
	const unavailableOn = target.kind === "unavailable" ? target.node : undefined;
	const disabled = launched || inFlight !== undefined || !!unavailableOn;
	const launch = (harnessArgs: string[]) => {
		if (disabled || target.kind !== "ready") return;
		setLaunched(true);
		launchBuild(launchAssist, itemId, target, harnessArgs);
	};
	const tooltip = playTooltip(inFlight !== undefined, unavailableOn);
	if (compact)
		return (
			<PlayButton
				tooltip={tooltip}
				disabled={disabled}
				onClick={(event) => {
					event.stopPropagation();
					launch([]);
				}}
			/>
		);
	return (
		<BuildSplitButton
			tooltip={tooltip}
			disabled={disabled}
			onBuild={() => launch([])}
			onSelectHarness={(kind) => launch(["--harness", kind])}
		/>
	);
}
