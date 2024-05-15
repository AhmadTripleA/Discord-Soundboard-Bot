import chalk from 'chalk';
const BOT_NAME = process.env.BOT_NAME;

export function replyToCommand(message) {

    const command = message.content.toLowerCase();

    switch (command) {
        case `hi ${BOT_NAME} `:
        case `hi assistant`:
            message.reply(`Hello ${message.author.username}!`);
            message.react('❤️');
            break;
        case 'ahmad work days':
        case 'ahmad schedule':
            message.reply(`Mondays, Wednesdays, and Thursdays!`);
            break;
        case 'kus emak':
            message.reply(`la tta3em`);
            break;
        case 'fuck you':
        case 'fuck you ahmad':
        case 'fuck you assistant':
        case `fuck you ${BOT_NAME} `:
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
        case 'khara 3ala ahmad':
        case '5ara 3ala ahmad':
        case 'khara 3a ahmad':
        case '5ara 3a ahmad':
        case 'ahmad khara':
        case 'ahmad 5ara':
        case 'ahmad manyak':
        case 'ahmad manyook':
            message.react('🖕');
            message.react('🫵');
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