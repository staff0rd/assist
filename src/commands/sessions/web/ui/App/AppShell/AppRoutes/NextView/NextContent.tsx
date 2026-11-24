import Stack from "@mui/material/Stack";
import type { NextResponse } from "../../../../../next/types";
import type { SessionInfo } from "../../../../types";
import { NextGroups } from "./NextGroups";
import { NextPickupStatus } from "./NextPickupStatus";
import { NextRecommended } from "./NextRecommended";
import type { NextSectionsProps } from "./NextSectionsProps";
import { useCloneLookup } from "./useCloneLookup";
import { NextCloneContext } from "./useNextClone";
import { NextSessionsContext } from "./useNextSessions";
import { useNextSessionsValue } from "./useNextSessionsValue";
import type { PickupState } from "./useStartPickup";

export function NextContent({
	data,
	actions,
	pickup,
	spacing,
	sessions,
	selectSession,
}: {
	data: NextResponse;
	actions: Omit<NextSectionsProps, "data">;
	pickup: PickupState;
	spacing: string;
	sessions: SessionInfo[];
	selectSession: (id: string) => void;
}) {
	const cloneFor = useCloneLookup(data.scope.selfRepo);
	const nextSessions = useNextSessionsValue(sessions, selectSession);
	return (
		<NextCloneContext.Provider value={cloneFor}>
			<NextSessionsContext.Provider value={nextSessions}>
				<Stack spacing={spacing}>
					<NextPickupStatus {...pickup} />
					<NextRecommended data={data} {...actions} />
					<NextGroups data={data} {...actions} />
				</Stack>
			</NextSessionsContext.Provider>
		</NextCloneContext.Provider>
	);
}
