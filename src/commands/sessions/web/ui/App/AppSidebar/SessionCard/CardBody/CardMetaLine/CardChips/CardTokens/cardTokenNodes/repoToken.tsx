import Box from "@mui/material/Box";
import type { SessionType } from "../../../../../../../../../../shared/deriveHistoryFields";
import type { CardToken } from "./CardToken";
import { isRepoScoped } from "../../../../../../../isRepoScoped";
import { repoLabel } from "../../../../../../../repoLabel";

const repoSx = { color: "text.secondary", whiteSpace: "nowrap" } as const;

export function repoToken(
	cwd: string | undefined,
	type: SessionType,
): CardToken | undefined {
	const repo = isRepoScoped(type) ? repoLabel(cwd) : "";
	if (!repo) return undefined;

	return {
		key: "repo",
		node: (
			<Box component="span" sx={repoSx}>
				{repo}
			</Box>
		),
	};
}
