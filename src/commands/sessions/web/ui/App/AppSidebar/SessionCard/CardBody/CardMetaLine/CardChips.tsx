import { CardBadges } from "./CardChips/CardBadges";
import { CardTokens } from "./CardChips/CardTokens";
import type { SessionInfo } from "../../../../../types";

export function CardChips({ session }: { session: SessionInfo }) {
	return (
		<>
			<CardTokens session={session} />
			<CardBadges session={session} />
		</>
	);
}
