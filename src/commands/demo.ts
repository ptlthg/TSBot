import { Message } from 'discord.js';
import { Command, CommandAccess, CommandOptions, CommandType } from '../classes/Command';

const options: CommandOptions = {
	name: 'demo',
	description: 'This is what a command looks like',
	type: CommandType.MESSAGE,
	access: CommandAccess.ALL,
	usage: '(Idk)'
}

const execute = (message: Message) => {
	message.reply({ content: 'Wild' });
}

export const command = new Command(options, execute);