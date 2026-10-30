import { eq } from "drizzle-orm";
import type { Db } from "./Db";
import { userConfig } from "./userConfig";

type UserConfigUpdate<T> =
	| { ok: true; config: Record<string, unknown>; result: T }
	| { ok: false; errors: string[] };

export async function updateUserConfig<T>(
	orm: Db,
	update: (current: Record<string, unknown>) => UserConfigUpdate<T>,
): Promise<UserConfigUpdate<T>> {
	return orm.transaction(async (tx) => {
		const [row] = await tx
			.select()
			.from(userConfig)
			.where(eq(userConfig.id, 1))
			.for("update");
		const outcome = update(row?.config ?? {});
		if (!outcome.ok) return outcome;
		if (Object.keys(outcome.config).length === 0) {
			await tx.delete(userConfig).where(eq(userConfig.id, 1));
			return outcome;
		}
		await tx
			.insert(userConfig)
			.values({ id: 1, config: outcome.config })
			.onConflictDoUpdate({
				target: userConfig.id,
				set: { config: outcome.config, updatedAt: new Date() },
			});
		return outcome;
	});
}
