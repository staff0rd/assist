import type { InternalTesterResult } from "./addInternalTester";
import { type AddTesterOptions, addTester } from "./addTester";
import type { TestflightConfig } from "./readTestflightConfig";

export type AddTesterOutcome = {
	result: InternalTesterResult;
	message: string;
	waiting: boolean;
};

const messages: Record<
	InternalTesterResult,
	(email: string, group: string) => string
> = {
	created: (email, group) => `Invited ${email} to TestFlight group "${group}"`,
	added: (email, group) =>
		`Added existing tester ${email} to TestFlight group "${group}"`,
	"already-in-group": (email, group) =>
		`${email} is already in TestFlight group "${group}"`,
	invited: (email) =>
		`Sent ${email} an App Store Connect team invite. Once they accept, add them again to put them in TestFlight.`,
	"invite-pending": (email) =>
		`${email} has not yet accepted their App Store Connect team invite. Add them again once they do.`,
};

const waitingResults = new Set<InternalTesterResult>([
	"already-in-group",
	"invite-pending",
]);

export async function addTesterOutcome(
	config: TestflightConfig,
	email: string,
	options: AddTesterOptions = {},
): Promise<AddTesterOutcome> {
	const result = await addTester(config, email, options);
	const group = options.internal
		? (config.internalGroup ?? "")
		: config.externalGroup;
	return {
		result,
		message: messages[result](email, group),
		waiting: waitingResults.has(result),
	};
}
