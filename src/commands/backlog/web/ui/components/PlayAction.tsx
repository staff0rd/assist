import { useLiveSessionsContext } from "../../../../sessions/web/ui/useLiveSessionsContext";
import { BuildSplitButton } from "./BuildSplitButton";
import { CloneOnNodeButton } from "./CloneOnNodeButton";
import { CompactPlaySplitButton } from "./CompactPlaySplitButton";
import { InFlightSessionButton } from "./InFlightSessionButton";
import type { CloseItemTarget } from "./CloseItemDialog";
import type { OrderEnds } from "./newestFirstListMoveButtons";
import { runInFlightSession } from "./runInFlightSession";
import { useBuildLaunch } from "./useBuildLaunch";
import { useStartTarget } from "./useStartTarget";
import { playTooltip } from "./playTooltip";

export function PlayAction({
	itemId,
	origin,
	compact,
	orderEnds,
}: {
	itemId: number;
	origin?: string;
	compact?: CloseItemTarget;
	orderEnds?: OrderEnds;
}) {
	const target = useStartTarget(origin);
	const inFlight = runInFlightSession(useLiveSessionsContext(), itemId);
	const { unavailableOn, disabled, launch } = useBuildLaunch(itemId, target);
	if (target.kind === "clone")
		return <CloneOnNodeButton target={target.prompt} />;
	if (inFlight) return <InFlightSessionButton session={inFlight} />;
	const tooltip = playTooltip(unavailableOn);
	if (compact)
		return (
			<CompactPlaySplitButton
				itemId={itemId}
				tooltip={tooltip}
				disabled={disabled}
				onBuild={() => launch([])}
				closeTarget={compact}
				orderEnds={orderEnds}
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
