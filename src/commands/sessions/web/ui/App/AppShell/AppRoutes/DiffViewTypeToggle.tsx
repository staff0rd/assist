import type { SvgIconComponent } from "@mui/icons-material";
import ViewColumnOutlined from "@mui/icons-material/ViewColumnOutlined";
import ViewStreamOutlined from "@mui/icons-material/ViewStreamOutlined";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import type { ViewType } from "react-diff-view";

const options: { value: ViewType; label: string; Icon: SvgIconComponent }[] = [
	{ value: "unified", label: "Unified view", Icon: ViewStreamOutlined },
	{ value: "split", label: "Split view", Icon: ViewColumnOutlined },
];

export function DiffViewTypeToggle({
	viewType,
	onChange,
}: {
	viewType: ViewType;
	onChange: (viewType: ViewType) => void;
}) {
	return (
		<Box sx={{ display: "flex", flex: "0 0 auto" }}>
			{options.map(({ value, label, Icon }) => {
				const active = viewType === value;
				return (
					<IconButton
						key={value}
						size="small"
						title={label}
						aria-label={label}
						aria-pressed={active}
						onClick={() => onChange(value)}
						sx={{
							color: active ? "text.primary" : "text.disabled",
							bgcolor: active ? "action.selected" : undefined,
							"&:hover": { color: "text.primary" },
						}}
					>
						<Icon sx={{ fontSize: 16 }} />
					</IconButton>
				);
			})}
		</Box>
	);
}
