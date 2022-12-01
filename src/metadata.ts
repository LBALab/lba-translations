// from https://github.com/LBALab/lba-packager/blob/main/src/services/metadata.ts

import axios from 'axios';

export interface EntryMetadata {
    type: string;
    game: 'BOTH' | 'LBA1' | 'LBA2';
    description: string;
}

export interface Metadata {
    description: string;
    entries: EntryMetadata[];
}

const BASE_URL = 'https://raw.githubusercontent.com/LBALab/metadata/main/';

export async function getMetadataForHQR(
    game: string,
    filename: string,
): Promise<Metadata | undefined> {
    if (filename.endsWith('.VOX')) {
        filename = `VOX/XX${filename.substring(2)}`;
    }
    const [metadata] = await Promise.all([
        axios.get(`${BASE_URL}/${game}/HQR/${filename}.json`),
    ]);
    if (metadata.status < 400) {
        try {
            return (await metadata.data) as Metadata;
        } catch (e) {
            // ignore
        }
    }
    return undefined;
}
