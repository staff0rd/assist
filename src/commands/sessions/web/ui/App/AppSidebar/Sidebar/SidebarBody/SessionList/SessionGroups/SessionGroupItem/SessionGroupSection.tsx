import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { GroupHeader } from "./SessionGroupSection/GroupHeader";
import { InRepoGroupContext } from "../../../../../useInRepoGroupContext";

const containerSx = { mb: 0.5 } as const;

const bodySx = { ml: "17px", borderLeft: 1, borderColor: "divider" } as const;

export function SessionGroupSection({
	label,
	sessionIds,
	onDismiss,
	children,
}: {
	label: string;
	sessionIds: string[];
	onDismiss: (id: string) => void;
	children: ReactNode;
}) {
	return (
		<Box sx={containerSx}>
			<GroupHeader
				label={label}
				sessionIds={sessionIds}
				onDismiss={onDismiss}
			/>
			<Box sx={bodySx}>
				<InRepoGroupContext.Provider value>
					{children}
				</InRepoGroupContext.Provider>
			</Box>
		</Box>
	);
}
