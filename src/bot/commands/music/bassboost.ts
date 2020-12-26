import type { Message } from 'discord.js';
import MoosikCommand from '../../structures/MoosikCommand';

const levels = {
	none: 0.0,
	low: 0.1,
	medium: 0.15,
	high: 0.25,
	extreme: 0.4,
};

export default class BassboostCommand extends MoosikCommand {
	public constructor() {
		super('bassboost', {
			category: 'music',
			channel: 'guild',
			aliases: ['bassboost', 'bass', 'bb'],
			description: {
				content: 'Sets or displays the bass boosting effect.',
				usage: '[none|low|medium|high|extreme]',
				examples: ['', 'medium'],
			},
			args: [
				{
					id: 'level',
					type: Object.keys(levels),
					prompt: {
						start: `what would you like to set the bass boost level to? Please pick from ${Object.keys(levels)
							.map((l) => `\`${l}]`)
							.join(', ')}.`,
						retry: `what would you like to set the bass boost level to? Please pick from ${Object.keys(levels)
							.map((l) => `\`${l}]`)
							.join(', ')}.`,
						optional: true,
					},
				},
			],
		});
	}

	public async exec(
		msg: Message,
		{
			level,
		}: {
			level: string | null;
		},
	): Promise<Message | Message[] | void> {
		if (!msg.member?.voice.channel) return msg.util?.reply('You must be in a voice channel!');
		const player = this.client.music.get(msg.guild!.id);
		if (!player) return msg.util?.reply('No music is playing!');

		if (player.voiceChannel !== msg.member.voice.channelID)
			return msg.util?.reply("What makes you think I'll let you rain on their parade?!");

		const oldBoost = player.bands[0];
		const [friendlyLevel] = Object.entries(levels).find(([, value]) => value === oldBoost)!;
		if (level === null) return msg.util?.reply(`The bass boost level is at \`${friendlyLevel}\`.`);

		if (levels[level.toLowerCase()] === oldBoost)
			return msg.util?.reply(`The bass boost level is already at \`${level.toLowerCase()}\`!`);

		const bands = new Array(3).fill(null).map((_, band) => ({ band, gain: levels[level.toLowerCase()] }));
		player.setEQ(...bands);

		return msg.util?.reply(`Changed the bass boost level from \`${oldBoost}\` to \`${level.toLowerCase()}%\`!`);
	}
}
