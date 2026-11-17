import { loadConfig } from "../../shared/loadConfig";

export function isDatabaseConfigured(): boolean {
	return Boolean(process.env.ASSIST_DATABASE_URL ?? loadConfig().database.url);
}
