import fs from 'fs';
import path from 'path';

// Function to get all .wav files from the audio directory
function getAudioFiles() {
    const audioDir = path.join(__dirname, '../audio');
    return fs.readdirSync(audioDir).filter(file => file.endsWith('.wav'));
}

// Array of audio file names
export const audioFiles = getAudioFiles();