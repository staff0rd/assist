import Box from "@mui/material/Box";
import type { ReactNode } from "react";
import { GroupHeader } from "./SessionGroupSection/GroupHeader";
import { InRepoGroupContext } from "../../../../../useInRepoGroupContext";
import type { SessionInfo } from "../../../../../../../types";
import { useCollapsedGroups } from "../../../../../useCollapsedGroups";

const containerSx = { mb: 0.5 } as const;

export function SessionGroupSection({
	groupKey,
	label,
	sessions,
	onDismiss,
	children,
}: {
	groupKey: string;
	label: string;
	sessions: SessionInfo[];
	onDismiss: (id: string) => void;
	children: ReactNode;
}) {
	const { isCollapsed, setCollapsed } = useCollapsedGroups();
	const collapsed = isCollapsed(groupKey);
	return (
		<Box sx={containerSx}>
			<GroupHeader
				label={label}
				sessions={sessions}
				collapsed={collapsed}
				pinned={collapsed}
				onToggle={() => setCollapsed(groupKey, !collapsed)}
				onDismiss={onDismiss}
			/>
			{!collapsed && (
				<InRepoGroupContext.Provider value>
					{children}
				</InRepoGroupContext.Provider>
			)}
		</Box>
	);
}
