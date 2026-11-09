import type { HarnessKind } from "../harnesses";
import type { SpawnResult } from "../spawnInherit";
import type { CapabilityId } from "./capabilityDefinitions";

export type CapabilityStatus =
	| { supported: true }
	| {
			supported: false;
			reason: string;
			remediation: string;
			followUp?: string;
	  };

type CapabilityDeclaration = CapabilityStatus | (() => CapabilityStatus);

export type CapabilityDeclarations = Record<
	CapabilityId,
	CapabilityDeclaration
>;

export type HarnessCapabilitySource = {
	label: string;
	capabilities: CapabilityDeclarations;
	detect?: () => CapabilityStatus;
};

export type HarnessFeature = {
	id: string;
	label: string;
	requires: CapabilityId[];
};

export type Unavailability = {
	capability: CapabilityId | "harness.detected" | "harness.enabled";
	reason: string;
	remediation: string;
	followUp?: string;
};

export type FeatureResolution =
	| { available: true }
	| { available: false; reasons: Unavailability[] };

export type HarnessActivityIdentity = {
	harness?: HarnessKind;
	claudeSessionId?: string;
	harnessSessionId?: string;
};

type LaunchSkillOptions = {
	conversationId?: string;
	cwd: string;
};

export type ConversationRef = {
	cwd?: string;
	claudeSessionId?: string;
	harnessSessionId?: string;
};

export type HarnessAdapter = HarnessCapabilitySource & {
	kind: string;
	detect: () => CapabilityStatus;
	conversation: {
		idName: string;
		findResumable: (ref: ConversationRef) => string | undefined;
	};
	launchSkill: (
		skill: string,
		args: string | undefined,
		options: LaunchSkillOptions,
	) => SpawnResult;
	resume: (
		conversationId: string,
		nudge: string,
		options: { cwd: string },
	) => SpawnResult;
	activityIdentity: (
		conversationId: string | undefined,
		resumedId?: string,
	) => HarnessActivityIdentity;
};
