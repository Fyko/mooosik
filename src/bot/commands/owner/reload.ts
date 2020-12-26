import { Argument, Listener } from 'discord-akairo';
import type { Message } from 'discord.js';
import MoosikCommand from '../../structures/MoosikCommand';

export default class ReloadCommand extends MoosikCommand {
	public constructor() {
		super('reload', {
			aliases: ['reload'],
			category: 'owner',
			ownerOnly: true,
			description: {
				content: 'Reloads a module.',
				usage: '<module>',
			},
			args: [
				{
					id: 'mod',
					type: Argument.union('commandAlias', 'listener'),
					prompt: {
						start: 'what command or listener would you like to reload?',
						retry: "please provide a valid command or listener that you'd like to reload.",
						optional: true,
					},
				},
				{
					id: 'all',
					match: 'flag',
					flag: ['--all'],
				},
			],
		});
	}

	public async exec(
		msg: Message,
		{ mod, all }: { mod: MoosikCommand | Listener | null; all: boolean },
	): Promise<Message | Message[] | void> {
		if (all) {
			try {
				await new Promise((resolve) => resolve(this.handler.reloadAll()));
				await new Promise((resolve) => resolve(this.client.listenerHandler.reloadAll()));
				return msg.util?.reply(
					`successfully reloaded \`${this.handler.modules.size}\` command and \`${this.client.listenerHandler.modules.size}\` listeners.`,
				);
			} catch (err) {
				return msg.util?.reply(`failed to reload all with error: \`${err}\`.`);
			}
		}

		if (!mod) return msg.util?.reply(`please provide a valid command or listener to reload.`);

		const handler = mod instanceof MoosikCommand ? this.handler : this.client.listenerHandler;

		try {
			await new Promise((resolve) => resolve(handler.reload(mod.id)));
			return msg.util?.reply(
				`successfully reloaded the \`${mod.id}\` ${mod instanceof MoosikCommand ? 'command' : 'listener'}.`,
			);
		} catch (err) {
			return msg.util?.reply(
				`failed to reload ${mod instanceof MoosikCommand ? 'command' : 'listener'} ${mod.id}: \`${err}\``,
			);
		}
	}
}
