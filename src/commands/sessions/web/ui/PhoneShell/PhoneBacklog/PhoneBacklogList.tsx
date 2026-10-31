import Box from "@mui/material/Box";
import { useState } from "react";
import { safeAreaInsets } from "../../designSystem/safeAreaInsets";
import type { SessionSocket } from "../../useSessionSocket";
import { PhoneBackButton } from "../PhoneBackButton";
import { PhoneNavBar } from "../PhoneNavBar";
import { phoneEmptySx } from "../phoneEmptySx";
import { PhoneSearchField } from "../PhoneSearchField";
import { PhoneBacklogSections } from "./PhoneBacklogSections";
import { PhoneRepoSelect } from "./PhoneRepoSelect";
import { usePhoneBacklogRepos } from "./usePhoneBacklogRepos";
import { usePickedRepo } from "./usePickedRepo";

const bodySx = {
	flex: 1,
	minHeight: 0,
	overflowY: "auto",
	WebkitOverflowScrolling: "touch",
	pb: safeAreaInsets.bottom,
} as const;

export function PhoneBacklogList({ socket }: { socket: SessionSocket }) {
	const repos = usePhoneBacklogRepos(socket);
	const { repo, pick } = usePickedRepo(repos);
	const [query, setQuery] = useState("");

	return (
		<>
			<PhoneNavBar
				left={<PhoneBackButton label="Sessions" to="/" />}
				title="Backlog"
			/>
			<PhoneSearchField
				value={query}
				onChange={setQuery}
				placeholder="Filter items"
			/>
			{repos && repos.length > 0 && (
				<PhoneRepoSelect repos={repos} repo={repo} onPick={pick} />
			)}
			<Box sx={bodySx}>
				{repo ? (
					<PhoneBacklogSections
						cwd={repo.cwd}
						query={query}
						sessions={socket.sessions}
					/>
				) : (
					<Box sx={phoneEmptySx}>
						{repos ? "No open backlog items" : "Loading…"}
					</Box>
				)}
			</Box>
		</>
	);
}
