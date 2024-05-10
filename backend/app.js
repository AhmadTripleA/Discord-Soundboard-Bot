import dotenv from 'dotenv';
dotenv.config({ path: "./../config.env" });
import chalk from 'chalk';
import { Client, GatewayIntentBits } from 'discord.js';
import {
    joinVoiceChannel, createAudioPlayer,
    createAudioResource, AudioPlayerStatus,
    getVoiceConnection, VoiceConnectionStatus
} from '@discordjs/voice';
import fs from 'fs';
import path from 'path';
import { audioFiles, __dirname } from './audioUpdate.js';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

const player = createAudioPlayer();
player.setMaxListeners(50);

const botName = 'ahmad assistant';

client.once('ready', () => {
    console.log('Bot is online!');
    console.log(audioFiles);
});

client.on('messageCreate', async message => {
    try {
        if (message.author.bot) return;

        const command = message.content.toLowerCase();

        if (audioFiles.includes(`${command.toLocaleLowerCase()}.wav`)) {
            soundboard(message);
        }
        else {
            replyToCommand(message);
        }

    } catch (error) {
        console.error(error);
    }
});

function soundboard(message) {
    const command = message.content.toLowerCase();
    console.log(`Playing ${command} !`);
    try {
        if (message.member.voice.channel) {
            const channel = message.member.voice.channel;
            const currentConnection = getVoiceConnection(channel.guild.id);
            if (currentConnection) {
                const currentSubscription = currentConnection.state.subscription;
                if (currentSubscription && player.state.status !== AudioPlayerStatus.Playing) {
                    // Safely destroy the connection only if it's not already destroyed
                    if (currentConnection.state.status !== VoiceConnectionStatus.Destroyed) {
                        currentConnection.destroy();
                        console.log('Bot was in a channel and not playing. Left the channel.');
                    } else {
                        console.log('Connection already destroyed.');
                    }
                } else {
                    console.log('Bot is currently playing audio.');
                }
            } else {
                console.log('Bot is not in any voice channel.');
            }
            // Ensure that a new connection is only created if there isn't an existing one
            let connection;
            if (!currentConnection || currentConnection.state.status === VoiceConnectionStatus.Destroyed) {
                connection = joinVoiceChannel({
                    channelId: channel.id,
                    guildId: channel.guild.id,
                    adapterCreator: channel.guild.voiceAdapterCreator,
                });
            } else {
                connection = currentConnection;
            }

            const filePath = path.join(__dirname, 'audio', `${command}.wav`);
            const resource = createAudioResource(fs.createReadStream(filePath));
            player.play(resource);
            connection.subscribe(player);
            player.on(AudioPlayerStatus.Idle, () => {
                // Check if the connection is still valid before attempting to destroy it
                if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                    connection.destroy();
                }
                player.removeAllListeners(AudioPlayerStatus.Idle); // Remove the listener after handling the event
            });

        } else {
            console.log('You need to join a voice channel first!');
        }
    } catch (error) {
        console.error(error);
    }
}

function replyToCommand(message) {

    const command = message.content.toLowerCase();

    switch (command) {
        case `hi ${botName} `:
        case `hi assistant`:
            message.reply(`Hello ${message.author.username} !`);
            break;
        case 'ahmad work days':
            message.reply(`Mondays, Wednesdays, and Thursdays!`);
            break;
        case 'khara 3aleek':
        case 'khara 3a ahmad':
        case 'ahmad khara':
            message.reply(`Khara 3aleek la7alak`);
            break;
        case 'kus emak':
            message.reply(`la tta3em`);
            break;
        case 'fuck you':
        case 'fuck you ahmad':
        case 'fuck you assistant':
        case `fuck you ${botName} `:
            message.reply(`Fuck you la7alak`);
            break;
        case 'i swallowed a baby':
            message.reply(`Good Protein!!`);
            break;
        case 'i swallowed a baby':
            message.reply(`Good Protein!!`);
            break;
        case 'mimo':
        case 'mimo khara':
        case 'mimo ya khara':
        case 'khara 3a mimo':
        case 'khara 3alek mimo':
            message.reply(`mmmaaaAAAOOOOWWW`);
            break;
        case 'nice':
        case 'good shit':
        case '3arasi':
        case '3arasy':
            message.react('👍');
            break;
        default:
            console.log(
                chalk.red(`${message.author.username.toLocaleUpperCase()}: `) +
                chalk.white(`${message.content} `) +
                chalk.gray(`(${message.createdAt.toLocaleTimeString('en-US')})`)
            );
            break;
    }
}

const sendMessageRandomly = () => {
    const randomTime = Math.random() * (14400000 - 3600000) + 3600000;
    setTimeout(() => {
        // Specify the channel ID where you want to send the message
        const channel = client.channels.cache.get('616752127196528663');
        if (channel) {
            channel.send('Mimo khara 3alek');
        } else {
            console.log('Channel not found');
        }
        // Call the function again to set another timeout
        sendMessageRandomly();
    }, randomTime);
}

sendMessageRandomly();

client.login(DISCORD_TOKEN);
