import CheckIcon from "@mui/icons-material/Check";
import { backlogTarget } from "../../backlogTarget";
import type { SessionInfo } from "../../types";
import { PhoneSheetItem } from "./PhoneSheetItem";

export function PhoneMarkDoneItem({
	session,
	onClick,
}: {
	session: SessionInfo;
	onClick: () => void;
}) {
	if (!backlogTarget(session)) return null;
	return (
		<PhoneSheetItem
			label="Mark done…"
			icon={<CheckIcon fontSize="small" />}
			onClick={onClick}
		/>
	);
}
