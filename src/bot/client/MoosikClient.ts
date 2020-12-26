import { AkairoClient, CommandHandler, InhibitorHandler, ListenerHandler } from 'discord-akairo';
import type { ColorResolvable, Message } from 'discord.js';
import { Manager, Node } from 'erela.js';
import { join } from 'path';
import type { Logger } from 'winston';
import SettingsProvider from '../../database';
import MoosikCommand from '../structures/MoosikCommand';
import { intents } from '../util/constants';
import { logger } from '../util/logger';

declare module 'discord-akairo' {
	interface AkairoClient {
		logger: Logger;
		commandHandler: CommandHandler;
		listenerHandler: ListenerHandler;
		config: ClientOptions;
		settings: SettingsProvider;
		music: Manager;
	}
}

interface ClientOptions {
	token: string;
	owners: string | string[];
	color: ColorResolvable;
	prefix: string;
}

export default class MoosikClient extends AkairoClient {
	public constructor(config: ClientOptions) {
		super({
			messageCacheLifetime: 300,
			messageCacheMaxSize: 50,
			messageSweepInterval: 900,
			ownerID: config.owners,
			shards: 'auto',
			ws: { intents },
		});

		this.config = config;
	}

	public readonly config: ClientOptions;

	public readonly logger: Logger = logger;

	public readonly music: Manager = new Manager({
		autoPlay: true,
		clientId: process.env.DISCORD_CLIENT_ID!,
		nodes: [
			{
				host: process.env.LAVALINK_HOST!,
				port: Number(process.env.LAVALINK_PORT!),
				password: process.env.LAVALINK_PASSWORD!,
				identifier: 'Orion',
				retryDelay: 3000,
			},
		],
		send: (id, payload) => {
			const guild = this.guilds.cache.get(id);
			if (guild) guild.shard.send(payload);
		},
	});

	public readonly commandHandler: CommandHandler = new CommandHandler(this, {
		directory: join(__dirname, '..', 'commands'),
		prefix: async (msg: Message): Promise<string> => {
			if (msg.guild) {
				const doc = await this.settings.guild(msg.guild.id);
				if (doc.prefix) return doc.prefix;
			}
			return this.config.prefix;
		},
		aliasReplacement: /-/g,
		classToHandle: MoosikCommand,
		allowMention: true,
		handleEdits: true,
		commandUtil: true,
		commandUtilLifetime: 3e5,
		ignoreCooldown: this.ownerID,
		ignorePermissions: this.ownerID,
		defaultCooldown: 3000,
		argumentDefaults: {
			prompt: {
				modifyStart: (msg: Message, str: string) =>
					`${msg.author}, ${str}\n...or type \`cancel\` to cancel this command.`,
				modifyRetry: (msg: Message, str: string) =>
					`${msg.author}, ${str}\n... or type \`cancel\` to cancel this command.`,
				timeout: 'You took too long. Command cancelled.',
				ended: 'You took more than 3 tries! Command canclled',
				cancel: 'Sure thing, command cancelled.',
				retries: 3,
				time: 60000,
			},
			otherwise: '',
		},
	});

	public readonly inhibitorHandler: InhibitorHandler = new InhibitorHandler(this, {
		directory: join(__dirname, '..', 'inhibitors'),
	});

	public readonly listenerHandler: ListenerHandler = new ListenerHandler(this, {
		directory: join(__dirname, '..', 'listeners'),
	});

	public readonly settings: SettingsProvider = new SettingsProvider(this);

	private async load(): Promise<this> {
		await this.settings.init();

		this.on('raw', (d: any) => this.music.updateVoiceState(d));

		this.listenerHandler.setEmitters({
			commandHandler: this.commandHandler,
			inhibitorHandler: this.inhibitorHandler,
			listenerHandler: this.listenerHandler,
			shard: this,
		});

		this.commandHandler.useInhibitorHandler(this.inhibitorHandler);
		this.commandHandler.useListenerHandler(this.listenerHandler);

		this.listenerHandler.loadAll();
		this.commandHandler.loadAll();
		this.inhibitorHandler.loadAll();

		this.music.on('nodeConnect', (node: Node) =>
			this.logger.info(`[MUSIC]: Successfully connected to Node ${node.options.identifier}`),
		);
		this.music.on('nodeCreate', (node: Node) =>
			this.logger.info(`[MUSIC]: Successfully created Node ${node.options.identifier!}`),
		);
		this.music.on('nodeDisconnect', (node: Node, reason) =>
			this.logger.warn(
				`[MUSIC]: Disconnected from Node ${node.options.identifier!} with reason ${reason.reason} (code ${
					reason.code
				})`,
			),
		);
		this.music.on('nodeError', (node: Node, error) =>
			this.logger.error(`[MUSIC]: Disconnected from Node ${node.options.identifier!} with error ${error.message}`),
		);
		this.music.on('nodeReconnect', (node: Node) =>
			this.logger.info(`[MUSIC]: Reconnected to Node ${node.options.identifier!}!`),
		);

		return this;
	}

	public async launch(): Promise<void> {
		await this.load();
		await this.login(this.config.token);
		this.music.init(this.user!.id);
	}
}
