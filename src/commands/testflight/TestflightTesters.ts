export type TeamStatus = "pending" | "joined";

export type TesterState =
	| "not-in-group"
	| "not-invited"
	| "invited"
	| "accepted"
	| "installed"
	| "revoked";

export type InternalPerson = {
	email: string;
	team: TeamStatus;
	testflight: TesterState;
};

export type ExternalTester = { email: string; testflight: TesterState };

export type TestflightTesters = {
	bundleId: string;
	internal: InternalPerson[];
	external: ExternalTester[];
};
