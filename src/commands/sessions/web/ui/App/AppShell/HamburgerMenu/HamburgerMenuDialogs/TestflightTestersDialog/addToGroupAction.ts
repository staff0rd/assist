import type { InternalPerson } from "../../../../../../../../testflight/TestflightTesters";

export function addToGroupAction(
	person: InternalPerson,
	pending: string | undefined,
	onAddToGroup: (email: string) => void,
) {
	if (person.team !== "joined" || person.testflight !== "not-in-group")
		return undefined;
	return {
		pending: pending === person.email,
		disabled: pending !== undefined,
		onClick: () => onAddToGroup(person.email),
	};
}
