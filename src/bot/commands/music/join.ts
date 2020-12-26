import type { Message, MessageReaction } from 'discord.js';
import MoosikCommand from '../../structures/MoosikCommand';

export default class JoinCommand extends MoosikCommand {
	public constructor() {
		super('join', {
			category: 'music',
			channel: 'guild',
			aliases: ['join'],
			description: {
				content: 'Joins your current voice channel.',
			},
		});
	}

	public async exec(msg: Message): Promise<Message | Message[] | MessageReaction | void> {
		if (!msg.member?.voice.channel) return msg.util?.reply('you must be in a voice channel!');
		if (!msg.member.voice.channel.joinable)
			return msg.util?.reply("I don't have permissions to join your voice channel.");
		if (!msg.member.voice.channel.speakable)
			return msg.util?.reply("I don't have permissions to speak in your voice channel.");

		const player =
			this.client.music.get(msg.member.voice.channelID!) ??
			this.client.music.create({
				guild: msg.guild!.id,
				voiceChannel: msg.member.voice.channelID!,
				textChannel: msg.channel.id,
			});

		if (player.voiceChannel !== msg.member.voice.channelID) player.setVoiceChannel(msg.member.voice.channelID!);
		if (player.state !== 'CONNECTED') player.connect();

		return msg.util?.reply('Joined your voice channel!');
	}
}
