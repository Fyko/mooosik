import { Argument, PrefixSupplier } from 'discord-akairo';
import type { Message } from 'discord.js';
import MoosikCommand from '../../structures/MoosikCommand';

export default class PrefixCommand extends MoosikCommand {
	public constructor() {
		super('prefix', {
			category: 'utilities',
			aliases: ['prefix'],
			args: [
				{
					id: 'prefix',
					type: Argument.validate('string', (_, p) => !/\s/.test(p) && p.length <= 8),
					prompt: {
						start: 'what would you like to change the command prefix to?',
						retry: "please provide a valid prefix with no spaces that's less than 8 characters.",
						optional: true,
					},
				},
			],
			description: {
				content: 'Changes or displays the command prefix.',
				usage: '[prefix]',
				examples: ['', '?', '>'],
			},
		});
	}

	public async exec(msg: Message, { prefix }: { prefix: string | null }): Promise<Message | Message[] | void> {
		const settings = await (this.handler.prefix as PrefixSupplier)(msg);
		if (!msg.guild) {
			return msg.util?.reply(`The command prefix is \`${settings}\`.`);
		}

		// if a user missing the Manage Guild permissions tries to change the prefix
		if (
			prefix &&
			!msg.member?.permissions.has('MANAGE_GUILD') &&
			!(this.handler.ignorePermissions as string[]).includes(msg.author.id)
		)
			prefix = null;
		if (!prefix) {
			return msg.util?.reply(`the current command prefix for \`${msg.guild.name}\` is \`${settings}\`.`);
		}

		const guild = await this.client.settings.guild(msg.guild.id);
		guild.prefix = prefix;
		await guild.save();

		return msg.util?.reply(`successfully changed the command prefix from \`${settings}\` to \`${prefix}\`.`);
	}
}
