#!/usr/bin/env node
import { Command } from "commander";
import { registerCommands } from "./registerCommands.js";

const program = new Command();

program.name("assist").description("CLI application").version("1.0.0");

registerCommands(program);

program.parse();
