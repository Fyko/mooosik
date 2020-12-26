import { Message, MessageReaction, Permissions, TextChannel, VoiceChannel } from 'discord.js';
import MoosikCommand from '../../structures/MoosikCommand';

export default class LeaveCommand extends MoosikCommand {
	public constructor() {
		super('leave', {
			category: 'music',
			channel: 'guild',
			aliases: ['leave'],
			description: {
				content: 'Discards the queue and leaves the voice channel.',
			},
		});
	}

	public async exec(msg: Message): Promise<Message | Message[] | MessageReaction | void> {
		const player = this.client.music.get(msg.guild!.id);
		if (!player) return msg.util?.reply('no music is playing!');

		const channel = this.client.channels.cache.get(player.voiceChannel!) as VoiceChannel;

		// eslint-disable-next-line prettier/prettier
		if ((!msg.member?.voice.channel && channel.members.size > 1) || (player.voiceChannel !== msg.member!.voice.channelID))
			return msg.util?.reply("what makes you think I'll let you rain on their parade?");

		player.destroy();

		return (msg.channel as TextChannel).permissionsFor(this.client.user!.id)?.has(Permissions.FLAGS.ADD_REACTIONS)
			? msg.react('👋')
			: msg.util?.reply('Cya!');
	}
}
