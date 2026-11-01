import type { TransferTarget } from "../../transfer/useTransferTargets";
import { PhoneSheetItem } from "./PhoneSheetItem";

type Props = {
	targets: TransferTarget[] | null;
	onPick: (target: TransferTarget) => void;
};

export function PhoneTransferTargets({ targets, onPick }: Props) {
	if (targets === null) return <PhoneSheetItem label="Finding nodes…" />;
	if (targets.length === 0)
		return <PhoneSheetItem label="No connected node has this repo" />;
	return targets.map((target) => (
		<PhoneSheetItem
			key={target.node}
			label={target.node}
			detail={target.cwd}
			onClick={() => onPick(target)}
		/>
	));
}
