import type { IPty } from "node-pty";
import type { HarnessKind } from "../harnesses";

type InteractivePty = IPty;
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

type LaunchOptions = {
	conversationId?: string;
	cwd: string;
	allowEdits?: boolean;
};

type ResumeOptions = { cwd: string; allowEdits?: boolean };

export type OneShotOptions = { timeout: number };

type InteractiveLaunch = {
	sessionId: string;
	conversationId?: string;
	prompt?: string;
	cwd?: string;
	design?: boolean;
	auto?: boolean;
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
		locate: (conversationId: string) => Promise<string | null>;
	};
	launchSkill: (
		skill: string,
		args: string | undefined,
		options: LaunchOptions,
	) => SpawnResult;
	launchPrompt: (prompt: string, options: LaunchOptions) => SpawnResult;
	resume: (
		conversationId: string,
		nudge: string,
		options: ResumeOptions,
	) => SpawnResult;
	interactive: (launch: InteractiveLaunch) => InteractivePty;
	oneShot: (prompt: string, options: OneShotOptions) => Promise<string>;
	activityIdentity: (
		conversationId: string | undefined,
		resumedId?: string,
	) => HarnessActivityIdentity;
};
