import {
	bugFeature,
	designFeature,
	draftFeature,
	sessionFeature,
} from "../../../../../../../../shared/harnessAdapters/harnessFeatures";
import { PLACEHOLDER, type SessionMode } from "../../../dispatchMode";

export const newSessionModes = {
	draft: {
		placeholder: "Describe the backlog item to draft...",
		submitLabel: "Start draft",
		autoStartLabel: "Start draft + auto start",
		sessionMode: "assist-draft",
		harnessFeature: draftFeature.id,
	},
	bug: {
		placeholder: "Describe the bug: what happened, what you expected...",
		submitLabel: "File bug",
		autoStartLabel: "File bug + auto start",
		sessionMode: "assist-bug",
		harnessFeature: bugFeature.id,
	},
	prompt: {
		placeholder: PLACEHOLDER,
		submitLabel: "Start session",
		harnessFeature: sessionFeature.id,
		picksModel: true,
	},
	design: {
		placeholder: "Describe the design task...",
		submitLabel: "Start design",
		harnessFeature: designFeature.id,
		picksModel: true,
	},
} satisfies Record<
	string,
	{
		placeholder: string;
		submitLabel: string;
		autoStartLabel?: string;
		sessionMode?: SessionMode;
		harnessFeature?: string;
		picksModel?: boolean;
	}
>;

export type NewSessionMode = keyof typeof newSessionModes;

export function autoStartLabel(mode: NewSessionMode): string | undefined {
	const config = newSessionModes[mode];
	return "autoStartLabel" in config ? config.autoStartLabel : undefined;
}

export function harnessFeatureFor(mode: NewSessionMode): string | undefined {
	const config = newSessionModes[mode];
	return "harnessFeature" in config ? config.harnessFeature : undefined;
}

export function picksModel(mode: NewSessionMode): boolean {
	const config = newSessionModes[mode];
	return "picksModel" in config && config.picksModel;
}

export const newSessionModeOrder = Object.keys(
	newSessionModes,
) as NewSessionMode[];
