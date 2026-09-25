import ExpandMore from "@mui/icons-material/ExpandMore";
import Button from "@mui/material/Button";
import { DiffOptionMenu } from "../DiffOptionMenu";
import { DiffScopeLabel } from "./DiffScopeButton/DiffScopeLabel";
import { activeDiffScope, diffScopeOptions } from "../../diffScopeOptions";
import type { DiffScopeState } from "../useDiffScopeState";
import { useMenuAnchor } from "../useMenuAnchor";

const buttonSx = {
	minWidth: 0,
	flex: "0 1 auto",
	height: 28,
	px: 0.75,
	textTransform: "none",
	fontSize: 13,
	fontWeight: 500,
	color: "text.primary",
	"& .MuiButton-endIcon": { ml: 0.25, color: "text.disabled" },
} as const;

export function DiffScopeButton({
	scope,
	commits,
	branchBase,
	onChange,
	compact,
}: DiffScopeState & {
	onChange: (scope: string) => void;
	compact: boolean;
}) {
	const menu = useMenuAnchor();
	const options = diffScopeOptions(commits, branchBase);
	const active = activeDiffScope(options, scope);

	return (
		<>
			<Button
				size="small"
				aria-label="Diff scope"
				aria-haspopup="true"
				aria-expanded={menu.isOpen}
				onClick={menu.open}
				endIcon={<ExpandMore sx={{ fontSize: 16 }} />}
				sx={buttonSx}
			>
				<DiffScopeLabel
					label={active.label}
					note={compact ? undefined : active.note}
				/>
			</Button>
			<DiffOptionMenu
				anchorEl={menu.anchorEl}
				options={options}
				selected={active.value}
				onClose={menu.close}
				onPick={onChange}
			/>
		</>
	);
}
