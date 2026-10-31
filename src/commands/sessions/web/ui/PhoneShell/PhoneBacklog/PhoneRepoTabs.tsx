import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import { raisedBgcolor } from "../../designSystem/raisedBgcolor";
import { touchTarget } from "../../designSystem/touchTarget";
import type { PhoneBacklogRepo } from "./usePhoneBacklogRepos";

const rowSx = {
	flex: "none",
	display: "flex",
	gap: 0.75,
	px: 2,
	pt: 0.5,
	pb: 0.75,
	overflowX: "auto",
	scrollbarWidth: "none",
	"&::-webkit-scrollbar": { display: "none" },
} as const;

const tabSx = {
	flex: "none",
	minHeight: touchTarget,
	px: 1.5,
	gap: 0.75,
	borderRadius: "9px",
	bgcolor: raisedBgcolor,
	color: "text.secondary",
	fontSize: 14,
	fontWeight: 600,
	"&[aria-selected='true']": {
		bgcolor: "primary.main",
		color: "primary.contrastText",
	},
} as const;

const countSx = {
	fontFamily: "fontFamilyMono",
	fontWeight: 400,
	opacity: 0.75,
} as const;

export function PhoneRepoTabs({
	repos,
	value,
	onChange,
}: {
	repos: PhoneBacklogRepo[];
	value: string | undefined;
	onChange: (origin: string) => void;
}) {
	return (
		<Box role="tablist" aria-label="Repo" sx={rowSx}>
			{repos.map((repo) => (
				<ButtonBase
					key={repo.origin}
					role="tab"
					aria-selected={repo.origin === value}
					sx={tabSx}
					onClick={() => onChange(repo.origin)}
				>
					{repo.displayName}
					<Box component="span" sx={countSx}>
						{repo.openCount}
					</Box>
				</ButtonBase>
			))}
		</Box>
	);
}
