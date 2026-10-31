import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import IconButton from "@mui/material/IconButton";
import type { Theme } from "@mui/material/styles";
import { useState } from "react";
import { assistVersion } from "../App/AppShell/assistVersion";
import { useHomeNodeContext } from "../HomeNodeGate/useHomeNodeContext";

const messageSx = {
	flex: 1,
	minWidth: 0,
	justifyContent: "flex-start",
	textAlign: "left",
	font: "inherit",
	color: "inherit",
} as const;

const bannerSx = {
	flex: "none",
	display: "flex",
	alignItems: "center",
	gap: 1,
	pl: 2,
	pr: 0.5,
	py: 0.25,
	fontSize: 13,
	color: "warning.main",
	bgcolor: (t: Theme) => t.tokens.color.wash.warning,
	borderBottom: 1,
	borderColor: "divider",
} as const;

export function PhoneVersionBanner({ onOpen }: { onOpen?: () => void }) {
	const homeNode = useHomeNodeContext();
	const [dismissed, setDismissed] = useState(false);
	const connection = homeNode?.connection;
	const nodeVersion =
		connection?.kind === "connected" ? connection.health.version : undefined;
	if (dismissed || !nodeVersion || !assistVersion) return null;
	if (nodeVersion === assistVersion) return null;

	return (
		<Box sx={bannerSx} role="status" data-testid="phone-version-banner">
			<ButtonBase
				sx={messageSx}
				disabled={!onOpen}
				onClick={onOpen}
				data-testid="phone-version-banner-open"
			>
				App v{assistVersion} · {homeNode?.home?.name ?? "home node"} runs v
				{nodeVersion}. Tap to see node updates.
			</ButtonBase>
			<IconButton
				size="small"
				aria-label="Dismiss"
				sx={{ color: "inherit" }}
				onClick={() => setDismissed(true)}
			>
				<CloseIcon fontSize="small" />
			</IconButton>
		</Box>
	);
}
