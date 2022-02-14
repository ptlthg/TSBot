/* eslint-disable @typescript-eslint/ban-types */
import { ApplicationCommandOption, ApplicationCommandOptionType } from "discord.js";

export type CommandOptions = {
	name: string,
	description: string,
	aliases?: string[],
	access?: 'ALL' | 'DIRECT' | 'GUILD' | CommandAccess,
	usage?: string,
	permissions?: string[],
	type: 'SLASH' | 'MESSAGE' | 'COMPONENT' | CommandType,
	args?: CommandArgument[],
}

export class Command {
	name: string;
	description: string;
	aliases?: string[];
	usage?: string;
	access: 'ALL' | 'DIRECT' | 'GUILD' | CommandAccess;
	type: 'SLASH' | 'MESSAGE' | 'COMPONENT' | CommandType;
	permissions?: string[];
	args?: ApplicationCommandOption[];

	execute: Function;
	
	constructor(options: CommandOptions, execute: Function) {
		// Required values
		this.name = options.name;
		this.type = options.type;
		this.description = options.description;

		// Optional Values
		this.usage = options.usage;
		this.aliases = options.aliases;
		this.permissions = options.permissions;
		this.args = options.args;

		// Default Values
		this.access = options.access ?? 'ALL';

		this.execute = execute;
	}
}

export type CommandArgument = {
	name: string,
	type: ApplicationCommandOptionType,
	description: string,
	required: boolean,
}

// eslint-disable-next-line no-shadow
export enum CommandType {
	SLASH = 'SLASH',
	MESSAGE = 'MESSAGE',
	COMPONENT = 'COMPONENT'
}

// eslint-disable-next-line no-shadow
export enum CommandAccess {
	ALL = 'ALL',
	DIRECT = 'DIRECT',
	GUILD = 'GUILD'
}