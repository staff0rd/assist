import type { CapabilityDeclarations } from "../../shared/harnessAdapters/types";
import {
	supported,
	unsupported,
} from "../../shared/harnessAdapters/unsupported";

export const fakeHarnessCapabilities: CapabilityDeclarations = {
	"artifacts.publish": supported,
	"connector.gmail.read": supported,
	"connector.slack.read": supported,
	"conversation.preassignId": unsupported(
		"the fake harness names its own conversations",
		"none needed; it is a test double",
	),
	"conversation.relocate": supported,
	"conversation.resume": supported,
	"intercept.command": supported,
	"intercept.fileRead": supported,
	"intercept.fileWrite": supported,
	"intercept.question": supported,
	"oneShot.structured": supported,
	"oneShot.text": supported,
	"skills.native": supported,
	"systemPrompt.append": supported,
	"tasks.notifyOnExit": supported,
	"tools.restrict": supported,
	"transcript.read": supported,
	"usage.rateLimits": supported,
};
