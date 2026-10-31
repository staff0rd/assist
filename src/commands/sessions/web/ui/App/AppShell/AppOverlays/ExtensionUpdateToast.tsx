import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import { useState } from "react";
import { Toast } from "../../../Toast";
import { useNodeUpdatesContext } from "../useNodeUpdatesContext";

const RECHECK_AFTER_INSTALL_MS = 20_000;

export function ExtensionUpdateToast() {
	const { entries, refresh } = useNodeUpdatesContext();
	const [dismissed, setDismissed] = useState<string>();
	const extension = entries.find((entry) => entry.local)?.status?.extension;
	const offer =
		extension?.behind && extension.updateLink && extension.latest
			? extension
			: undefined;
	const open = offer !== undefined && dismissed !== offer.latest;
	const dismiss = () => setDismissed(offer?.latest);
	return (
		<Toast open={open}>
			<Alert
				severity="info"
				variant="filled"
				action={
					<>
						<Button
							color="inherit"
							size="small"
							href={offer?.updateLink}
							onClick={() => setTimeout(refresh, RECHECK_AFTER_INSTALL_MS)}
						>
							Install
						</Button>
						<Button color="inherit" size="small" onClick={dismiss}>
							Dismiss
						</Button>
					</>
				}
			>
				assist extension v{offer?.connected} → v{offer?.latest}
			</Alert>
		</Toast>
	);
}
