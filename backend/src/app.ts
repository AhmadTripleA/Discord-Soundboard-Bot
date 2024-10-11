import dotenv from 'dotenv';
dotenv.config({ path: "./config.env" });
import { Client, GatewayIntentBits, Message, VoiceBasedChannel } from 'discord.js';
import {
    joinVoiceChannel, createAudioPlayer,
    createAudioResource, AudioPlayerStatus,
    getVoiceConnection, VoiceConnectionStatus
} from '@discordjs/voice';
import fs from 'fs';
import path from 'path';
import { audioFiles } from './audioUpdate.js';
import { replyToCommand } from './reply.js';
import { handleImageAttachment } from './imgToGif.js';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const player = createAudioPlayer();
const generalVCId = '1226323600739401769';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates
    ]
});

player.setMaxListeners(50);

client.once('ready', async () => {
    console.log(audioFiles);
    // initFetching();  
    // khara3aMimo();
    console.log('Bot is online!');
});

client.on('messageCreate', async message => {
    try {
        // Check if the message has attachments
        if (message.attachments.size > 0) {
            if (message.content.toLowerCase() == "gif") {
                await handleImageAttachment(message);
                return;
            }
        }

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

function soundboard(message: Message) {
    const command = message.content.toLowerCase();
    try {
        if (!isWael(message.member?.id || '') && !message.member?.voice.channel) {
            console.log(`Blud wants to be Wael so hard.`);
            message.reply(`Blud wants to be Wael so hard. (join a vc first nigga)`);
            return;
        }

        if (message.member?.voice.channel || isWael(message.member?.id || '')) {
            const channel = findVoiceChannel(message);
            const currentConnection = getVoiceConnection(channel?.guild.id || '');

            if (currentConnection) {
                if (player.state.status !== AudioPlayerStatus.Playing) {
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

            let connection: any;
            if (!currentConnection || currentConnection.state.status === VoiceConnectionStatus.Destroyed) {
                if (!channel?.guild.voiceAdapterCreator) {
                    console.error('No valid voiceAdapterCreator available.');
                    return; // Early return if no adapter creator is available
                }
                connection = joinVoiceChannel({
                    channelId: channel?.id || '',
                    guildId: channel?.guild.id || '',
                    adapterCreator: channel.guild.voiceAdapterCreator
                });
            } else {
                connection = currentConnection;
            }

            const filePath = path.join(__dirname, '../audio', `${command}.wav`);
            const resource = createAudioResource(fs.createReadStream(filePath));
            player.play(resource);
            connection.subscribe(player);

            console.log(`Playing ${command} !`);
            player.on(AudioPlayerStatus.Idle, () => {
                if (connection.state.status !== VoiceConnectionStatus.Destroyed) {
                    connection.destroy();
                }
                player.removeAllListeners(AudioPlayerStatus.Idle);
            });
        } else {
            console.log('You need to join a voice channel first!');
        }
    } catch (error) {
        console.error(error);
    }
}
function findVoiceChannel(message: Message) {
    let channel = message.member?.voice.channel;
    if (!channel) {
        console.log('User is not in a voice channel, joining the specified channel.');
        const fetchedChannel = client.channels.cache.get(generalVCId);
        if (fetchedChannel?.isVoiceBased()) {
            channel = fetchedChannel as VoiceBasedChannel;
        } else {
            console.error('Specified channel is not a voice channel.');
            return null;
        }
    }
    return channel;
}
function isWael(id:string) {
    if (id === '171553425861902336') {
        console.log(`Wael Detected, Rules Tolerated.`);
        return true;
    };
    return false;
}
// function khara3aMimo() {
//     const randomTime = Math.random() * (7200000 - 1800000) + 1800000; // 7200000 ms = 2 hours, 1800000 ms = 30 minutes
//     setTimeout(() => {
//         // Specify the channel ID where you want to send the message
//         const channel = client.channels.cache.get('616752127196528663');
//         if (channel) {
//             channel.send('Mimo khara 3alek');
//         } else {
//             console.log('Channel not found');
//         }
//         // Call the function again to set another timeout
//         khara3aMimo();
//     }, randomTime);
// }
// async function getGeneralChannel() {
//     try {
//         if (DISCORD_TOKEN) {
//             const channel = await client.channels.fetch('616752127196528663');
//             console.log('Fetched New Channel: ' + channel.name);
//             return channel;
//         } else {
//             console.error('Failed to fetch channel: Token is undefined');
//         }
//     } catch (error) {
//         console.error('Failed to fetch channel:', error);
//     }
// }
// async function fetchLast100Messages(channel: Channel) {
//     if (channel.isTextBased()) {  // This checks if the channel is text-based
//         const options = { limit: 100 };
//         const messages = await channel.messages.fetch(options);
//         return messages;
//     } else {
//         console.error('Attempted to fetch messages from a non-text-based channel.');
//         return null;  // Return null or throw an error as appropriate
//     }
// };
// // async function initFetching() {
// //     try {
// //         const channel = await getGeneralChannel();
// //         if (channel) {
// //             const messages = await fetchLast1000Messages(channel);
// //             const content = messages?.map(message => message.content);
// //             console.log(content);
// //             console.log(`Number of messages fetched: ${messages?.size}`);
// //         } else {
// //             console.error('Channel not found or failed to fetch.');
// //         }
// //     } catch (error) {
// //         console.error('Error in fetching messages:', error);
// //     }
// // };

client.login(DISCORD_TOKEN).catch(console.error);
