import type { InternalPerson, TesterState } from "./TestflightTesters";

type GroupTester = { email: string; testflight: TesterState };

type InternalSources = {
	members: string[];
	invitees: string[];
	groupTesters: GroupTester[];
};

export function mergeInternalPeople({
	members,
	invitees,
	groupTesters,
}: InternalSources): InternalPerson[] {
	const people = new Map<string, InternalPerson>();
	const upsert = (email: string, person: Partial<InternalPerson>) => {
		const key = email.toLowerCase();
		const existing = people.get(key) ?? {
			email,
			team: "joined",
			testflight: "not-in-group",
		};
		people.set(key, { ...existing, ...person });
	};
	for (const email of invitees) upsert(email, { team: "pending" });
	for (const email of members) upsert(email, { team: "joined" });
	for (const tester of groupTesters)
		upsert(tester.email, { testflight: tester.testflight });
	return [...people.values()].sort((a, b) => a.email.localeCompare(b.email));
}
