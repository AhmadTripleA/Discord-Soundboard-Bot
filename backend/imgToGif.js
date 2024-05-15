import { AttachmentBuilder } from 'discord.js';

// Import node-fetch
import fetch from 'node-fetch';
import sharp from 'sharp';

export async function handleImageAttachment(message) {
    try {
        console.log('File Detected...');
        const attachment = message.attachments.first(); // Get the first attachment
        const imageUrl = attachment.url;
        
        // Use node-fetch to get the image buffer
        const response = await fetch(imageUrl);
        const arrayBuffer = await response.arrayBuffer();
        const imageBuffer = Buffer.from(arrayBuffer);

        const sharpImage = sharp(imageBuffer);
        const metadata = await sharpImage.metadata();
        if (['jpeg', 'png', 'tiff'].includes(metadata.format)) {
            console.log('Started Image Conversion...');
            const gifBuffer = await sharpImage.toFormat('gif');
            console.log('Finished Image Conversion!');
            const attachment = new AttachmentBuilder(gifBuffer, { name: 'converted.gif' });
            message.channel.send({ files: [attachment] });
        } else {
            message.reply('Please upload a valid image format (JPEG, PNG, TIFF).');
        }
    } catch (error) {
        console.error('An error occurred during conversion:', error);
    }
}
