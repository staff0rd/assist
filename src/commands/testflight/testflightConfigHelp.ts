import type { ConfigHelpEntry } from "../../shared/configHelp";

export const testflightConfigHelp: ConfigHelpEntry[] = [
	{
		key: "testflight.keyId",
		setter: "assist config set testflight.keyId N5YK6FM442",
		note: "App Store Connect API key id",
	},
	{
		key: "testflight.issuerId",
		setter: "assist config set testflight.issuerId <uuid>",
		note: "App Store Connect API issuer id",
	},
	{
		key: "testflight.keyRef",
		setter: "assist config set testflight.keyRef op://<vault>/<item>/<field>",
		note: "1Password reference to the API key .p8 (read via op, never stored)",
	},
	{
		key: "testflight.bundleId",
		setter: "assist config set testflight.bundleId com.staff0rd.assist",
		note: "bundle id of the app whose testers are managed",
	},
	{
		key: "testflight.externalGroup",
		setter: "assist config set testflight.externalGroup <group name>",
		note: "external beta group that new testers are added to",
	},
	{
		key: "testflight.internalGroup",
		setter: "assist config set testflight.internalGroup <group name>",
		note: "internal beta group for App Store Connect team members",
	},
];
