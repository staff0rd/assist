import type {
	TeamStatus,
	TesterState,
} from "../../../../../../../../testflight/TestflightTesters";

type Pill = { label: string; color: string };

const team: Record<TeamStatus, Pill> = {
	joined: { label: "Team · Joined", color: "success.main" },
	pending: { label: "Team · Pending", color: "warning.main" },
};

const testflight: Record<TesterState, Pill> = {
	installed: { label: "Installed", color: "success.main" },
	accepted: { label: "Accepted", color: "primary.main" },
	invited: { label: "Invite sent", color: "warning.main" },
	"not-invited": { label: "Not invited", color: "text.secondary" },
	"not-in-group": { label: "Not in group", color: "text.secondary" },
	revoked: { label: "Revoked", color: "error.main" },
};

export const testerPills = { team, testflight };
