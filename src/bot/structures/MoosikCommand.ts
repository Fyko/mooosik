import { Command, CommandOptions } from 'discord-akairo';
import type MoosikClient from '../client/MoosikClient';

export interface MoosikCommandDescriptionFlag {
	flags: string[];
	description: string;
}

export interface MoosikCommandDescription {
	content?: string;
	usage?: string;
	examples?: string[];
	flags?: MoosikCommandDescriptionFlag[];
}

export interface MoosikCommandOptions extends CommandOptions {
	description?: MoosikCommandDescription;
}

export default class MoosikCommand extends Command {
	public constructor(id: string, options?: MoosikCommandOptions) {
		super(id, options);
	}

	public client!: MoosikClient;
	public description!: MoosikCommandDescription;
}
