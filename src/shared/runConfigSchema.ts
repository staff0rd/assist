import { z } from "zod";

const runParamSchema = z.strictObject({
	name: z.string(),
	required: z.boolean().optional(),
	default: z.string().optional(),
	description: z.string().optional(),
});

export const runConfigSchema = z.strictObject({
	name: z.string(),
	command: z.string(),
	args: z.array(z.string()).optional(),
	params: z.array(runParamSchema).optional(),
	env: z.record(z.string(), z.string()).optional(),
	filter: z.string().optional(),
	pre: z.array(z.string()).optional(),
	cwd: z.string().optional(),
	quiet: z.boolean().optional(),
	server: z.boolean().optional(),
	port: z.number().optional(),
});

export const runLinkSchema = z.strictObject({
	link: z.string(),
	prefix: z.string(),
});
