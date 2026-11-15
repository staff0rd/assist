import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";

const LABEL = "Too verbose: say it again, shorter";

export function TooVerboseButton({ onClick }: { onClick: () => void }) {
	return (
		<Tooltip title={LABEL}>
			<IconButton
				size="small"
				aria-label={LABEL}
				onClick={onClick}
				sx={{ ml: "auto" }}
			>
				<Box
					component="span"
					aria-hidden
					sx={(theme) => ({
						fontSize: theme.tokens.density.iconButton.smallIcon,
						lineHeight: 1,
					})}
				>
					🙄
				</Box>
			</IconButton>
		</Tooltip>
	);
}
