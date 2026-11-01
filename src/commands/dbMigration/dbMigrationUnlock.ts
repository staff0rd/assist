import { mkdirSync, writeFileSync } from "node:fs";
import { randomInt } from "node:crypto";
import chalk from "chalk";
import { getRestrictedDir } from "../codeComment/getRestrictedDir";
import { sweepRestrictedDir } from "../codeComment/sweepRestrictedDir";
import { deliverPinNotification } from "../notify/deliverPinNotification";
import { getMigrationPinPath } from "./getMigrationPinPath";
import { nextMigrationId } from "./nextMigrationId";

export async function dbMigrationUnlock(): Promise<void> {
	const migrationId = nextMigrationId();
	const pin = randomInt(0, 1000).toString().padStart(3, "0");

	mkdirSync(getRestrictedDir(), { recursive: true });
	sweepRestrictedDir();
	writeFileSync(getMigrationPinPath(pin), JSON.stringify({ pin, migrationId }));

	console.error(
		chalk.yellow.bold(
			"THIS IS YOUR LAST CHANCE TO RECONSIDER BEFORE INVOLVING A HUMAN.\n" +
				"Requesting this pin pages a real person to approve a new database migration.\n" +
				"A schema change is hard to reverse once shipped. You had BETTER have confirmed\n" +
				"the change with the user and be certain this migration is genuinely necessary.",
		),
	);

	const { delivered, node } = await deliverPinNotification({
		area: "db-migration",
		pin,
		title: "assist db-migration pin",
		message: `Pin ${pin} — run: assist db-migration confirm ${pin}`,
	});

	if (!delivered) {
		console.error(
			chalk.red(
				"Could not deliver the confirmation pin via notification.\n" +
					"The migration cannot be approved until the notification channel works.",
			),
		);
		process.exitCode = 1;
		return;
	}

	console.log(
		`A confirmation pin was sent to your desktop notifications${node ? ` on ${node}, the node controlling this session` : ""}.\nTo approve creating migration ${migrationId}, run${node ? ` on ${node}` : ""}:\n${chalk.cyan("  assist db-migration confirm <PIN>")}\nusing the pin from that notification.`,
	);
}
