import MoveUpIcon from "@mui/icons-material/MoveUp";
import { PhoneSheetItem } from "./PhoneSheetItem";

type Props = {
	label: string;
	onCancel: () => void;
};

export function PhoneCancelTransferItem({ label, onCancel }: Props) {
	return (
		<PhoneSheetItem
			label="Cancel pending transfer"
			detail={label}
			icon={<MoveUpIcon fontSize="small" />}
			onClick={onCancel}
		/>
	);
}
