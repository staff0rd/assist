import { useState } from "react";
import { useLiveSessionsContext } from "../../../../sessions/web/ui/useLiveSessionsContext";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { formatItemId } from "../../../formatItemId";
import { useRepoCwd } from "../useRepoCwd";
import { BuildSplitButton } from "./BuildSplitButton";
import { PlayButton } from "./PlayButton";
import { runInFlightSession } from "./runInFlightSession";

export function PlayAction({
	itemId,
	compact = false,
}: {
	itemId: number;
	compact?: boolean;
}) {
	const { launchAssist } = useSessionLaunchContext();
	const cwd = useRepoCwd();
	const inFlight = runInFlightSession(useLiveSessionsContext(), itemId);
	// Latch on first click so a double-click can't spawn two sessions before
	// the list refresh flips the item out of the playable state.
	const [launched, setLaunched] = useState(false);
	const disabled = launched || inFlight !== undefined;
	const launch = (harnessArgs: string[]) => {
		if (disabled) return;
		setLaunched(true);
		launchAssist(["backlog", "run", formatItemId(itemId), ...harnessArgs], cwd);
	};
	const tooltip = inFlight
		? "Already running — close that session to run it again"
		: "Build";
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
