import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import { useState } from "react";
import { PhoneSheetNavHeader } from "../PhoneNewSession/PhoneSheetNavHeader";
import { PhoneSearchField } from "../PhoneSearchField";
import { phoneSheetPaperSx } from "../phoneSheetPaperSx";
import { PhoneRepoOptions } from "./PhoneRepoOptions";
import type { PhoneBacklogRepo } from "./usePhoneBacklogRepos";

const paperSx = { ...phoneSheetPaperSx, height: "calc(100% - 64px)" };

const listSx = { flex: 1, minHeight: 0, overflowY: "auto" } as const;

export function PhoneRepoSheet({
	open,
	repos,
	value,
	onPick,
	onClose,
}: {
	open: boolean;
	repos: PhoneBacklogRepo[];
	value: string | undefined;
	onPick: (origin: string) => void;
	onClose: () => void;
}) {
	const [query, setQuery] = useState("");
	const close = () => {
		setQuery("");
		onClose();
	};
	return (
		<Drawer
			anchor="bottom"
			open={open}
			onClose={close}
			slotProps={{ paper: { sx: paperSx } }}
		>
			<PhoneSheetNavHeader title="Repo" backLabel="Cancel" onBack={close} />
			<PhoneSearchField
				value={query}
				onChange={setQuery}
				placeholder="Filter repos"
			/>
			<Box sx={listSx}>
				<PhoneRepoOptions
					repos={repos}
					query={query}
					value={value}
					onPick={(origin) => {
						onPick(origin);
						close();
					}}
				/>
			</Box>
		</Drawer>
	);
}
