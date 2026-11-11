import type { ConfigHelpEntry } from "../shared/configHelp";
import { autoConfirmHintCommand } from "./sync/printAutoConfirmHint";

export const rootConfigHelp: Record<string, ConfigHelpEntry[]> = {
	sync: [
		{
			key: "sync.autoConfirm",
			setter: autoConfirmHintCommand,
			note: "skip the settings.json overwrite prompt",
		},
		{
			key: "sync.preferences",
			setter: "assist config set sync.preferences true --node",
			note: "also merge assist's author preferences (claude/preferences.json) into settings.json",
		},
	],
	commit: [
		{
			key: "commit.conventional",
			setter: "assist config set commit.conventional true",
			note: "enforce conventional commit message format",
		},
		{
			key: "commit.pull",
			setter: "assist config set commit.pull true",
			note: "pull before committing",
		},
		{
			key: "commit.push",
			setter: "assist config set commit.push true",
			note: "push after committing",
		},
		{
			key: "commit.expectedBranch",
			setter: "assist config set commit.expectedBranch main",
			note: "warn when committing off this branch",
		},
	],
	notify: [
		{
			key: "notify.enabled",
			setter: "assist config set notify.enabled false",
			note: "enable or disable desktop notifications (default: enabled)",
		},
	],
	screenshot: [
		{
			key: "screenshot.outputDir",
			setter: "assist config set screenshot.outputDir ./screenshots",
			note: "directory screenshots are written to (default: ./screenshots)",
		},
	],
};
