import { stripIndents } from 'common-tags';
import { Argument, Category, PrefixSupplier } from 'discord-akairo';
import { Message, Permissions } from 'discord.js';
import MoosikCommand from '../../structures/MoosikCommand';

export default class HelpCommand extends MoosikCommand {
	public constructor() {
		super('help', {
			category: 'utilities',
			aliases: ['help'],
			description: {
				content: 'Displays all available commands or detailed info for a specific command.',
				usage: '[command]',
				examples: ['', 'ping', 'prefix'],
			},
			clientPermissions: [Permissions.FLAGS.EMBED_LINKS],
			args: [
				{
					id: 'arg',
					type: Argument.union('commandAlias', (_: Message, str: string): null | Category<string, MoosikCommand> => {
						if (!str) return null;
						const c = this.handler.categories.get(str.toLowerCase()) as Category<string, MoosikCommand> | undefined;
						if (c) return c;
						return null;
					}),
					prompt: {
						start: 'Which category or command would you like more info on?',
						retry: 'Please provide a valid categiry or command.',
						optional: true,
					},
				},
			],
		});
	}

	public async exec(
		msg: Message,
		{ arg }: { arg: undefined | MoosikCommand | Category<string, MoosikCommand> },
	): Promise<Message | Message[] | void> {
		const prefix = await (this.handler.prefix as PrefixSupplier)(msg);
		if (!arg) {
			const embed = this.client.util
				.embed()
				.setColor(msg.guild?.me?.displayColor ?? this.client.config.color)
				.setTitle('📝 Commands').setDescription(stripIndents`
					This is a list of the available categories and commands.
                    For more info on category or command, type \`${prefix}help <category/command>\`
                `);

			for (const category of this.handler.categories.values()) {
				if (category.id === 'owner' && !this.client.ownerID.includes(msg.author.id)) continue;
				const commands = category
					.filter((c) => c.aliases.length > 0)
					.map((cmd) => `\`${cmd.aliases[0]}\``)
					.join(', ');
				embed.addField(`${category.id.replace(/(\b\w)/gi, (lc) => lc.toUpperCase())}`, commands);
			}

			return msg.util?.send({ embed });
		}
		if (arg instanceof MoosikCommand) {
			const embed = this.client.util
				.embed()
				.setColor(msg.guild?.me?.displayColor ?? this.client.config.color)
				.setTitle(`\`${arg.aliases[0]} ${arg.description.usage ?? ''}\``)
				.addField('Description', arg.description.content ?? '\u200b');

			if (arg.aliases.length > 1) embed.addField('Aliases', `\`${arg.aliases.join('`, `')}\``);
			if (arg.description.flags)
				embed.addField(
					'Flags',
					arg.description.flags.map(
						({ description, flags }) => `${flags.map((f) => `\`${f}\``).join(', ')}: ${description}`,
					),
				);
			if (arg.description.examples?.length)
				embed.addField(
					'Examples',
					`\`${arg.aliases[0]} ${arg.description.examples.join(`\`\n\`${arg.aliases[0]} `)}\``,
				);

			return msg.util?.send({ embed });
		}

		const name = arg.id.replace(/(\b\w)/gi, (lc) => lc.toUpperCase());
		const embed = this.client.util
			.embed()
			.setColor(msg.guild?.me?.displayColor ?? this.client.config.color)
			.setTitle(name).setDescription(stripIndents`
				This is a list of all commands within the \`${name}\` category.
				For more info on a command, type \`${prefix}help <command>\`
			`);
		const commands = arg
			.array()
			.filter((c) => c.aliases.length > 0)
			.map(
				(cmd) =>
					`\`${cmd.aliases[0]}\`${
						cmd.description.content ? ` - ${cmd.description.content.split('\n')[0].substring(0, 120)}` : ''
					}`,
			)
			.join('\n');
		embed.addField('Commands', commands);
		return msg.util?.send({ embed });
	}
}
