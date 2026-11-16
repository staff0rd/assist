import { useHomeNodeContext } from "../HomeNodeGate/useHomeNodeContext";
import { PhoneListNavActions } from "./PhoneListNavActions";
import { PhoneNavBar } from "./PhoneNavBar";
import { PhoneNodeChip } from "./PhoneNodeChip";

export function PhoneSessionsNavBar({
	localNode,
	reconnecting,
	onOpenNodes,
	onNewSession,
}: {
	localNode: string | undefined;
	reconnecting: boolean;
	onOpenNodes?: () => void;
	onNewSession?: () => void;
}) {
	const homeName = useHomeNodeContext()?.home?.name;
	return (
		<PhoneNavBar
			left={
				<PhoneNodeChip
					name={homeName ?? localNode}
					tone={reconnecting ? "warn" : "ok"}
					onClick={onOpenNodes}
				/>
			}
			title="Sessions"
			right={<PhoneListNavActions onNewSession={onNewSession} />}
		/>
	);
}
