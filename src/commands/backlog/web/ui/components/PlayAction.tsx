import { useState } from "react";
import { useLiveSessionsContext } from "../../../../sessions/web/ui/useLiveSessionsContext";
import { useSessionLaunchContext } from "../../../../sessions/web/ui/useSessionLaunchContext";
import { formatItemId } from "../../../formatItemId";
import { useRepoCwd } from "../useRepoCwd";
import { HarnessDropdownButton } from "./HarnessDropdownButton";
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
	return (
		<>
			<PlayButton
				tooltip={
					inFlight
						? "Already running — close that session to run it again"
						: "Build"
				}
				disabled={disabled}
				compact={compact}
				onClick={(event) => {
					event.stopPropagation();
					launch([]);
				}}
			/>
			{!compact && (
				<HarnessDropdownButton
					label="Build with a different harness"
					disabled={disabled}
					onSelect={(kind) => launch(["--harness", kind])}
				/>
			)}
		</>
	);
}
