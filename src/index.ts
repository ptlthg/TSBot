import fs from 'fs';
import { Client, Intents, Collection, Permissions, Interaction, ApplicationCommandDataResolvable, Message, ApplicationCommandData } from 'discord.js';
import * as config from './config.json';
import { Command, CommandAccess, CommandType } from './classes/Command';
import { isValidAccess } from './classes/Util';

const proccessArgs = process.argv.slice(2);

const client = new Client({ 
	intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES, Intents.FLAGS.DIRECT_MESSAGES],
	partials: ['CHANNEL']
});

export const commands = new Collection<string, Command>();

const commandFiles = fs.readdirSync('./src/commands/').filter((file) => file.endsWith('.ts'));

for (const file of commandFiles) {
	/* 
	* There is surely a better way to load commands, but this is fine for now
	* as it only runs once on startup and allows you to only create a new file.
	*/
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const command = require(`./commands/${file}`);
	commands.set(command.command.name, command.command);
}

client.once('ready', async () => {
	if (client.user) {
		client.user.setActivity('the plebians', { type: 'WATCHING' });
	}

	console.log('Ready!');
});

client.on('interactionCreate', async (interaction: Interaction) => {
	if (interaction.isButton()) return;
	if (!interaction.isCommand()) return;
	if (!commands.has(interaction.commandName)) return;

	const command: Command | undefined = commands.get(interaction.commandName);
	if (!command || command.type !== CommandType.SLASH) return;

	if (interaction.channel && !isValidAccess(command.access, interaction.channel.type)) return;

	if (command.access !== CommandAccess.DIRECT && command.permissions) {
		// Get of user permissions
		const perms = (interaction.member?.permissions as Readonly<Permissions>).toArray();
		// Return if lacking one
		if (!(perms.every((perm) => command.permissions?.includes(perm)))) {
			return await interaction.reply({ 
				content: 'You don\'t have the required permissions for this command.', 
				allowedMentions: { repliedUser: true }, 
				ephemeral: true 
			});
		}
	}

	try {
		command.execute(interaction);
	} catch (error) {
		console.log(error);
		await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true }).catch();
	}
});

client.on('messageCreate', async (message: Message) => {
	if (message.author.bot) return;
	if (!message.content.startsWith(config.prefix)) return;

	const args = message.content.slice(config.prefix.length).split(/ +/);
	const _commandName = args.shift();
	
	if (_commandName === undefined) return;
	const commandName = _commandName.toLowerCase();

	const command: Command | undefined = commands.get(commandName);
	if (!command || command.type !== CommandType.MESSAGE) return;

	if (message.channel && !isValidAccess(command.access, message.channel.type)) return;

	if (command.access !== CommandAccess.DIRECT && command.permissions) {
		// Get user permissions
		const perms = (message.member?.permissions as Readonly<Permissions>).toArray();
		// Return if lacking one
		if (!(perms.every((perm) => command.permissions?.includes(perm)))) {
			await message.reply({ 
				content: 'You don\'t have the required permissions for this command.', 
				allowedMentions: { repliedUser: true } 
			});
		}
	}

	try {
		command.execute(message);
	} catch (error) {
		console.log(error);
		await message.reply({ content: 'There was an error while executing this command!'}).catch();
	}
});

client.login(config.token);

/*
*  ===================================================================
*	Command arguments on startup of script to do one-time operations
*
*		"deploy global" 	 - updates slash commands globally
*		"deploy <server id>" - updates slash commands in that server
*		Append "clear" to remove slash commands from a server
*  ===================================================================
*/

if (proccessArgs[0] === 'deploy') {
	const slashCommandsData: ApplicationCommandData[] = [];

	commands.forEach(command => {
		if (command.type !== 'SLASH') return;

		const commandData: ApplicationCommandData = {
			name: command.name,
			description: command.description,
		};
		if (command.args) {
			commandData.options = [];
			commandData.options.push(...command.args);
		}

		slashCommandsData.push(commandData);
	});

	if (proccessArgs[1] === 'global') {
		setTimeout(async function() {
			await client.application?.commands.set([]);
			await client.application?.commands.set(slashCommandsData as ApplicationCommandDataResolvable[]);
			console.log('Probably updated slash commands globally');
		}, 5000);
	} else if (proccessArgs[1]) {
		setTimeout(async function() {
			const guild = await client.guilds.fetch('' + proccessArgs[1]);
			const guildCommands = guild.commands;
			if (proccessArgs[2] !== 'clear') {
				guildCommands.set(slashCommandsData as ApplicationCommandDataResolvable[]);
			} else {
				guildCommands.set([]);
			}
			console.log('Probably updated slash commands on that server');
		}, 5000);
	}
}