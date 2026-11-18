import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";

export function ServerPillName({
	name,
	ended,
	selected,
	onOpen,
}: {
	name: string;
	ended: boolean;
	selected: boolean;
	onOpen: () => void;
}) {
	return (
		<>
			<Box
				component="span"
				sx={{
					width: 7,
					height: 7,
					borderRadius: "50%",
					flexShrink: 0,
					bgcolor: ended ? "text.disabled" : "success.main",
				}}
			/>
			<ButtonBase
				onClick={onOpen}
				aria-pressed={selected}
				title={`Open ${name} log`}
				sx={{
					font: "inherit",
					fontWeight: 600,
					minWidth: 0,
					overflow: "hidden",
					textOverflow: "ellipsis",
					whiteSpace: "nowrap",
					color: ended ? "text.secondary" : "text.primary",
				}}
			>
				{name}
			</ButtonBase>
		</>
	);
}
