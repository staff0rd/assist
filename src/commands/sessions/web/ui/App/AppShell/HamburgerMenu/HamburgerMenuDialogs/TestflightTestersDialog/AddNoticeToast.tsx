import Alert from "@mui/material/Alert";
import { Toast } from "../../../../../Toast";
import type { AddNotice } from "./useAddTester";

export function AddNoticeToast({
	notice,
	onClose,
}: {
	notice: AddNotice | null;
	onClose: () => void;
}) {
	return (
		<Toast open={notice !== null} autoHideDuration={8000} onClose={onClose}>
			<Alert
				severity={notice?.severity ?? "info"}
				variant="filled"
				onClose={onClose}
			>
				{notice?.message}
			</Alert>
		</Toast>
	);
}
