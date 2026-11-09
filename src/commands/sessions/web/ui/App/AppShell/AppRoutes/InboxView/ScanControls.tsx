import RefreshIcon from "@mui/icons-material/Refresh";
import Button from "@mui/material/Button";
import Tooltip from "@mui/material/Tooltip";
import { useHarnessCapabilities } from "../../../../useHarnessCapabilities";
import { inboxHarnessOptions } from "./inboxHarnessOptions";
import { inboxStore } from "./inboxStore";
import { ScanWithMenu } from "./ScanWithMenu";

export function ScanControls({ scanning }: { scanning: boolean }) {
	const capabilities = useHarnessCapabilities();
	return (
		<>
			<Tooltip title={scanning ? "A scan is already running" : ""}>
				<span>
					<Button
						variant="outlined"
						size="small"
						startIcon={<RefreshIcon />}
						disabled={scanning}
						onClick={() => void inboxStore.scan()}
					>
						{scanning ? "Scanning…" : "Scan now"}
					</Button>
				</span>
			</Tooltip>
			<ScanWithMenu
				options={inboxHarnessOptions(capabilities)}
				disabled={scanning}
				onPick={(harness) => void inboxStore.scan(harness)}
			/>
		</>
	);
}
