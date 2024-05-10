import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

// Determine the directory name from the current module file path
const __filename = fileURLToPath(import.meta.url);
export const __dirname = dirname(__filename);

// Function to get all .wav files from the audio directory
function getAudioFiles() {
    const audioDir = path.join(__dirname, 'audio');
    return fs.readdirSync(audioDir).filter(file => file.endsWith('.wav'));
}

// Array of audio file names
export const audioFiles = getAudioFiles();