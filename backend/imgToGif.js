import { AttachmentBuilder } from 'discord.js';
import fetch from 'node-fetch';
import sharp from 'sharp';
import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function handleImageAttachment(message) {
    try {
        console.log('File Detected...');
        const attachment = message.attachments.first(); // Get the first attachment
        const fileUrl = attachment.url;
        const fileName = path.basename(fileUrl.split('?')[0]); // Strip query parameters
        const filePath = path.join(__dirname, 'temp', fileName);

        console.log('Filename:', fileName);
        console.log('File Path:', filePath);

        // Use node-fetch to get the file buffer
        const response = await fetch(fileUrl);
        const arrayBuffer = await response.arrayBuffer();
        const fileBuffer = Buffer.from(arrayBuffer);

        // Save the file to the local filesystem
        fs.writeFileSync(filePath, fileBuffer);

        // Determine the file type
        const fileExtension = path.extname(fileName).slice(1).toLowerCase();
        const imageFormats = ['jpeg', 'jpg', 'png', 'tiff'];
        const videoFormats = ['mp4', 'mov', 'avi', 'webm'];

        if (imageFormats.includes(fileExtension)) {
            await convertImageToGif(fileBuffer, message);
        } else if (videoFormats.includes(fileExtension)) {
            await convertVideoToGif(filePath, message);
        } else {
            message.reply('Please upload a valid image or video format (JPEG, PNG, TIFF, MP4, MOV, AVI, WEBM).');
        }
    } catch (error) {
        console.error('An error occurred during conversion:', error);
        message.reply(`An error occurred: ${error.message}`);
    }
}

async function convertImageToGif(fileBuffer, message) {
    console.log('Started Image Conversion...');
    let gifBuffer = await sharp(fileBuffer)
        .resize({ width: 500 }) // Resize to a smaller width
        .gif({ quality: 80 }) // Reduce quality
        .toBuffer()
        .catch(err => { throw new Error(`Sharp error: ${err.message}`); });

    if (gifBuffer.length > 25 * 1024 * 1024) { // Check if the file size exceeds 25 MiB
        throw new Error('Converted GIF is too large to upload to Discord.');
    }

    const attachment = new AttachmentBuilder(gifBuffer, { name: 'converted.gif' });
    message.channel.send({ files: [attachment] });
}

async function convertVideoToGif(filePath, message) {
    console.log('Started Video Conversion...');
    const gifPath = path.join(__dirname, 'temp', 'converted.gif');

    // Construct the FFmpeg command
    const ffmpegCommand = `ffmpeg -i "${filePath}" -vf "fps=24,scale=512:-1:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5" -loop 0 "${gifPath}"`;

    try {
        // Execute the FFmpeg command
        await new Promise((resolve, reject) => {
            exec(ffmpegCommand, (error, stdout, stderr) => {
                if (error) {
                    console.error(`FFmpeg error: ${error.message}`);
                    reject(new Error(`FFmpeg error: ${error.message}`));
                } else {
                    console.log('FFmpeg conversion complete.');
                    console.log(stdout);
                    resolve();
                }
            });
        });

        let gifBuffer = fs.readFileSync(gifPath);

        // Optimize the GIF using sharp
        // gifBuffer = await sharp(gifBuffer)
        //     .resize({ width: 500 }) // Resize to a smaller width
        //     .gif({ quality: 90 }) // Reduce quality
        //     .toBuffer(gifBuffer);

        // Check if the file size exceeds 25 MiB
        const fileSizeInBytes = gifBuffer.length;
        const maxFileSizeInBytes = 25 * 1024 * 1024; // 25 MiB in bytes
        if (fileSizeInBytes > maxFileSizeInBytes) {
            throw new Error('Converted GIF is too large to upload to Discord.');
        }

        console.log('Converted GIF:', gifBuffer);

        const attachment = new AttachmentBuilder(gifBuffer, { name: 'converted.gif' });
        await message.channel.send({ files: [attachment] });
    } catch (err) {
        console.error('An error occurred:', err);
        message.reply('Failed to convert video to GIF.\n**' + err + '**');
    } finally {
        // Clean up temp files
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
        if (fs.existsSync(gifPath)) {
            fs.unlinkSync(gifPath);
        }
    }
}