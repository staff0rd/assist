import ExtensionIcon from "@mui/icons-material/Extension";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import MenuItem from "@mui/material/MenuItem";
import type { ExtensionUpdateStatus } from "../../../../../../shared/ExtensionUpdateStatus";
import { useNodeUpdatesContext } from "../../useNodeUpdatesContext";

function versionsText(extension: ExtensionUpdateStatus | undefined): string {
	if (!extension?.installLink) return "unavailable";
	const installed = extension.connected
		? `v${extension.connected} installed`
		: "not connected";
	return `${installed} · v${extension.latest} latest`;
}

export function FirefoxExtensionMenuItem({ onClose }: { onClose: () => void }) {
	const { entries } = useNodeUpdatesContext();
	const extension = entries.find((entry) => entry.local)?.status?.extension;
	const link = extension?.installLink;
	return (
		<MenuItem component="a" href={link} disabled={!link} onClick={onClose}>
			<ListItemIcon>
				<ExtensionIcon fontSize="small" />
			</ListItemIcon>
			<ListItemText
				primary="Firefox extension"
				secondary={versionsText(extension)}
			/>
		</MenuItem>
	);
}
