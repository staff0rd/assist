import CloseIcon from "@mui/icons-material/Close";
import type { SessionInfo } from "../../types";
import { isFinished } from "./isFinished";
import { PhoneSheetItem } from "./PhoneSheetItem";
import { usePhoneActions } from "./usePhoneActions";

export function PhoneEndItem({
	session,
	onDone,
	onConfirmEnd,
}: {
	session: SessionInfo;
	onDone: () => void;
	onConfirmEnd: () => void;
}) {
	const { dismiss } = usePhoneActions();
	const finished = isFinished(session);
	return (
		<PhoneSheetItem
			label={finished ? "Dismiss" : "End session…"}
			icon={<CloseIcon fontSize="small" />}
			danger
			onClick={
				finished
					? () => {
							dismiss(session);
							onDone();
						}
					: onConfirmEnd
			}
		/>
	);
}
