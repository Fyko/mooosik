import { Command, Constants, Listener } from 'discord-akairo';
import { Message, TextChannel, User } from 'discord.js';

const MISSING: Record<string, string> = {
	notOwner: 'this command is reserved for the server owner!',
};

export default class MissingPermissionsListener extends Listener {
	public constructor() {
		super('missingPermissions', {
			category: 'commandHandler',
			emitter: 'commandHandler',
			event: Constants.CommandHandlerEvents.MISSING_PERMISSIONS,
		});
	}

	public async exec(msg: Message, _: Command, type: any, missing: any): Promise<Message | Message[] | void> {
		if (Array.isArray(missing)) missing = missing[0];

		if (Object.keys(missing).includes(missing)) return msg.util!.reply(MISSING[missing]);

		let text;
		if (type === 'client') {
			const str = this.missingPermissions(msg.channel as TextChannel, this.client.user!, missing);
			text = `I'm missing ${str} to process that command!`;
		} else {
			const str = this.missingPermissions(msg.channel as TextChannel, msg.author, missing);
			text = `you're missing ${str} to use that command!`;
		}

		if (
			msg.guild &&
			msg.channel instanceof TextChannel &&
			msg.channel.permissionsFor(this.client.user!)!.has('SEND_MESSAGES')
		) {
			return msg.util!.reply(text);
		}
	}

	// credit to 1Computer1
	public missingPermissions(channel: TextChannel, user: User, permissions: any): string {
		const missingPerms = channel
			.permissionsFor(user)!
			.missing(permissions)
			.map((str: string): string => {
				if (str === 'VIEW_CHANNEL') return '`Read Messages`';
				if (str === 'SEND_TTS_MESSAGES') return '`Send TTS Messages`';
				if (str === 'USE_VAD') return '`Use VAD`';
				return `\`${str
					.replace(/_/g, ' ')
					.toLowerCase()
					.replace(/\b(\w)/g, (char: string): string => char.toUpperCase())}\``;
			});
		return missingPerms.length > 1
			? `${missingPerms.slice(0, -1).join(', ')} and ${missingPerms.slice(-1)[0]}`
			: missingPerms[0];
	}
}