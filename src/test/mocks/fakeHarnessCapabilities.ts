import type { CapabilityDeclarations } from "../../shared/harnessAdapters/types";
import {
	supported,
	unsupported,
} from "../../shared/harnessAdapters/unsupported";

export const fakeHarnessCapabilities: CapabilityDeclarations = {
	"artifacts.publish": supported,
	"connector.gmail.read": supported,
	"connector.slack.read": supported,
	"conversation.id": supported,
	"conversation.preassignId": unsupported(
		"the fake harness names its own conversations",
		"none needed; it is a test double",
	),
	"conversation.relocate": supported,
	"conversation.resume": supported,
	"intercept.command": supported,
	"intercept.fileRead": supported,
	"intercept.editDiff": supported,
	"intercept.fileWrite": supported,
	"intercept.question": supported,
	"launch.terminal": supported,
	"oneShot.structured": supported,
	"oneShot.text": supported,
	"preview.nextTurn": supported,
	"session.driven": unsupported(
		"the fake harness runs in a terminal",
		"none needed; it is a test double",
	),
	"skills.native": supported,
	"slashCommands.suggest": supported,
	"systemPrompt.append": supported,
	"tasks.background": unsupported(
		"the fake harness reports no background tasks",
		"none needed; it is a test double",
	),
	"tasks.notifyOnExit": supported,
	"tools.restrict": supported,
	"transcript.read": supported,
	"usage.rateLimits": supported,
};
