import { OpenPrButton } from "./CardPrActions/OpenPrButton";
import { ReviewButton } from "./CardPrActions/ReviewButton";
import { reviewTargetPr } from "../reviewTargetPr";
import type { SessionInfo } from "../../types";
import { usePrStatus } from "../usePrStatus";
import { ViewReviewButton } from "./CardPrActions/ViewReviewButton";

export function CardPrActions({ session }: { session: SessionInfo }) {
	const pr = usePrStatus(session.cwd, reviewTargetPr(session), session.status);
	const cwd = session.cwd;

	return (
		<>
			{pr && cwd && <OpenPrButton pr={pr} />}
			{pr && cwd && (
				<ReviewButton cwd={cwd} pr={pr} launchedFrom={session.id} />
			)}
			<ViewReviewButton session={session} />
		</>
	);
}
