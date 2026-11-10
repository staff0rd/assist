import { useState } from "react";
import { useLiveSessionsContext } from "../../../../sessions/web/ui/useLiveSessionsContext";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { BuildSplitButton } from "./BuildSplitButton";
import { CloneOnNodeButton } from "./CloneOnNodeButton";
import { CompactPlaySplitButton } from "./CompactPlaySplitButton";
import { InFlightSessionButton } from "./InFlightSessionButton";
import { launchBuild } from "./launchBuild";
import type { CloseItemTarget } from "./CloseItemDialog";
import { runInFlightSession } from "./runInFlightSession";
import { useStartTarget } from "./useStartTarget";
import { playTooltip } from "./playTooltip";

export function PlayAction({
	itemId,
	origin,
	compact,
}: {
	itemId: number;
	origin?: string;
	compact?: CloseItemTarget;
}) {
	const { launchAssist } = useSessionLaunchContext();
	const target = useStartTarget(origin);
	const inFlight = runInFlightSession(useLiveSessionsContext(), itemId);
	// Latch on first click so a double-click can't spawn two sessions before
	// the list refresh flips the item out of the playable state.
	const [launched, setLaunched] = useState(false);
	if (target.kind === "clone")
		return <CloneOnNodeButton target={target.prompt} />;
	if (inFlight) return <InFlightSessionButton session={inFlight} />;
	const unavailableOn = target.kind === "unavailable" ? target.node : undefined;
	const disabled = launched || !!unavailableOn;
	const launch = (harnessArgs: string[]) => {
		if (disabled || target.kind !== "ready") return;
		setLaunched(true);
		launchBuild(launchAssist, itemId, target, harnessArgs);
	};
	const tooltip = playTooltip(unavailableOn);
	if (compact)
		return (
			<CompactPlaySplitButton
				itemId={itemId}
				tooltip={tooltip}
				disabled={disabled}
				onBuild={() => launch([])}
				closeTarget={compact}
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
