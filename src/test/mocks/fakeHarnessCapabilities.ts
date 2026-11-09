import type { CapabilityDeclarations } from "../../shared/harnessAdapters/types";
import {
	supported,
	unsupported,
} from "../../shared/harnessAdapters/unsupported";

export const fakeHarnessCapabilities: CapabilityDeclarations = {
	"skills.native": supported,
	"conversation.resume": supported,
	"conversation.preassignId": unsupported(
		"the fake harness names its own conversations",
		"none needed; it is a test double",
	),
	"oneShot.text": supported,
	"oneShot.structured": supported,
	"usage.rateLimits": supported,
	"tools.restrict": supported,
	"connector.gmail.read": supported,
	"connector.slack.read": supported,
};
