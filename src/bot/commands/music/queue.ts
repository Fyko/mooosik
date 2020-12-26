import type { Message } from 'discord.js';
import type { Track } from 'erela.js';
import MoosikCommand from '../../structures/MoosikCommand';
import { paginate } from '../../util';
import ms from 'pretty-ms';

export default class QueueCommand extends MoosikCommand {
	public constructor() {
		super('queue', {
			category: 'music',
			channel: 'guild',
			aliases: ['queue', 'playing'],
			description: {
				content: 'Displays the queue.',
			},
			args: [
				{
					id: 'page',
					match: 'content',
					type: 'number',
					default: 1,
				},
			],
		});
	}

	public async exec(msg: Message, { page }: { page: number }): Promise<Message | Message[] | void> {
		if (!msg.member?.voice.channel) return msg.util?.reply('you must be in a voice channel!');
		const player = this.client.music.get(msg.guild!.id);
		if (!player) return msg.util?.reply('no music is playing!');

		const current = player.queue.current as Track;
		// eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
		const tracks = [current ?? { track: null }].concat([...player.queue.values()] as Track[]);
		const decoded = await this.client.music.decodeTracks(tracks.map((t) => t.track));

		const totalLength = decoded.reduce((prev, song) => prev + song.info.length, 0);
		const paginated = paginate(decoded.slice(1), page);
		let index = (paginated.page - 1) * 10;

		const embed = this.client.util
			.embed()
			.setColor(this.client.config.color)
			.addField('Now Playing', `[${decoded[0].info.title}](${decoded[0].info.uri})`)
			.addField(
				'Song Queue',
				`${
					paginated.items.length
						? paginated.items.map((song) => `**${++index}.** [${song.info.title}](${song.info.uri})`).join('\n')
						: 'No more songs in queue.'
				}`,
			)
			.addField('Total Queue Time', ms(totalLength));
		if (paginated.maxPage > 1) embed.setFooter(`Use ${msg.util?.parsed?.prefix}queue <page> to view a specific page.`);

		return msg.reply(embed);
	}
}
