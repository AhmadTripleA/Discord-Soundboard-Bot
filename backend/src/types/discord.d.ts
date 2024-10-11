export type Message = {
    content: string;
    author: string;
}

export type Command = {
    name: string;
    description: string;
    usage: string;
    aliases: string[];
}

export type CommandHandler = (message: Message, args: string[]) => void;

export type Commands = {
    [key: string]: CommandHandler;
}

export type Client = {
    commands: Commands;
}

export type ClientOptions = {
    token: string;
    prefix: string;
}
