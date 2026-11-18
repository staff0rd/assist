import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ButtonBase from "@mui/material/ButtonBase";

export function OtherGroupToggle({
	count,
	expanded,
	onToggle,
}: {
	count: number;
	expanded: boolean;
	onToggle: () => void;
}) {
	return (
		<ButtonBase
			onClick={onToggle}
			aria-expanded={expanded}
			sx={{
				alignSelf: "flex-start",
				gap: 0.75,
				typography: "caption",
				fontWeight: 600,
				letterSpacing: "0.06em",
				textTransform: "uppercase",
				color: "text.secondary",
			}}
		>
			<ExpandMoreIcon
				sx={{
					fontSize: 16,
					transform: expanded ? "none" : "rotate(-90deg)",
					transition: "transform 120ms",
				}}
			/>
			{`Other (${count})`}
		</ButtonBase>
	);
}
