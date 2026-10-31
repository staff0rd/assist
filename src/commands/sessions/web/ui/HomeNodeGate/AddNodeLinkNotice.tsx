import Alert from "@mui/material/Alert";
import { ErrorSnackbar } from "../ErrorSnackbar";
import { Toast } from "../Toast";
import type { AddNodeLinkStatus } from "./useAddNodeLink";

type Props = { status: AddNodeLinkStatus; onClose: () => void };

export function AddNodeLinkNotice({ status, onClose }: Props) {
	return (
		<>
			<Toast open={status.kind === "probing"}>
				<Alert severity="info" variant="filled">
					{status.kind === "probing" ? `Connecting to ${status.name}…` : ""}
				</Alert>
			</Toast>
			<ErrorSnackbar
				error={status.kind === "error" ? status.message : null}
				onClose={onClose}
			/>
		</>
	);
}
