import { ThreadChannelTypes } from "discord.js";
import { CommandAccess } from "./Command";

export function isValidAccess(access: 'ALL' | 'GUILD' | 'DIRECT', type: 'DM' | 'GUILD_NEWS' | 'GUILD_TEXT' | ThreadChannelTypes): boolean {
	if (access === CommandAccess.ALL) return true;
	// If access is direct, return true if type is also a DM, else false
	if (access === CommandAccess.DIRECT) return (type === 'DM');
	// Access has to be GUILD at this point, so return true as long as the channel isn't a DM
	return (type !== 'DM');
}