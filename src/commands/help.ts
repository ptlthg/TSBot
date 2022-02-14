import { BaseCommandInteraction, CommandInteractionOptionResolver, MessageEmbed } from 'discord.js';
import { Command, CommandAccess, CommandOptions, CommandType } from '../classes/Command';
import { commands } from '../index';
import * as config from '../config.json';

const options: CommandOptions = {
	name: 'help',
	description: 'Get a list of all commands!',
	usage: '(command name)',
	type: CommandType.SLASH,
	access: CommandAccess.ALL,
	args: [{
		name: 'command',
		description: 'Get more information on a command!',
		type: 'STRING',
		required: false
	}]
}

const execute = async (interaction: BaseCommandInteraction) => {
	const optionsResolvable = (interaction.options as CommandInteractionOptionResolver);
	const selectedCommand = optionsResolvable.getString('command');

	const prefix = (options.type === 'SLASH') ? '/' : config.prefix;

	let helpMenu;

	if (!selectedCommand) {
		helpMenu = getHelpEmbed();
		return interaction.reply({ embeds: [helpMenu], allowedMentions: { repliedUser: false }, ephemeral: true  });
	} else {
		const name = selectedCommand.toLowerCase();
		const command = commands.get(name) || commands.find(c => c.aliases !== undefined && c.aliases.includes(name));

		if (!command) {
			const embed = getHelpEmbed();
			return interaction.reply({ content: 'That\'s not a valid command! Here\'s the menu instead.', embeds: [embed], allowedMentions: { repliedUser: false }, ephemeral: true });
		}

		const embed = new MessageEmbed()
			.setColor('#03fc7b')
			.setTitle(`Usage for ${command.name}`);
		
		const data = [];
		data.push(`**Name:** ${command.name}`);

		if (command.description) data.push(`**Description:** ${command.description}`);
		if (command.usage) data.push(`**Usage:** ${prefix}${command.name} ${command.usage}`);

		embed.fields.push({
			name: 'Command Information',
			value: `${data.join('\n')}`,
			inline: false
		})

		return interaction.reply({ embeds: [embed], allowedMentions: { repliedUser: false }, ephemeral: true  });
	}

	function getHelpEmbed() {
		const embed = new MessageEmbed().setColor('#03fc7b');

		embed.setTitle('Here\'s a list of all the commands:')

		commands.forEach(command => {
			embed.fields.push({
				name: `${prefix}${command.name}`,
				value: `${command.description}\n${command.usage ? `Usage: ${prefix}${command.name} ${command.usage}` : ''}`,
				inline: false
			});
		});

		embed.setFooter({ text: `\nYou can send "/help [command name]" to get info on a specific command!` });
		return embed;
	}	
}

export const command = new Command(options, execute);