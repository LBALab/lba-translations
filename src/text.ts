import fs from 'fs';
import path from 'path';

import jconv from 'jconv';

import { HQR } from '@lbalab/hqr';

const toArrayBuffer = (b: Buffer) =>
    b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);

export async function loadTextData(game, hqr: HQR, language) {
    const mapEntry = hqr.entries[language.index];
    const entry = hqr.entries[language.index + 1];

    if (mapEntry == null) {
        return null;
    }

    const mapData = new Uint16Array(mapEntry.content);
    const data = new DataView(entry.content);

    const texts = [];
    let start;
    let end;
    let idx = 0;
    do {
        start = data.getUint16(idx * 2, true);
        end = data.getUint16(idx * 2 + 2, true);
        const type = game === 'lba2' ? data.getUint8(start++) : undefined;
        let quote = '';
        try {
            if (language.data.code === 'JPN') {
                const bytes = [];
                for (let i = start; i < end - 1; i += 1) {
                    bytes.push(data.getInt8(i));
                }
                // SJIS charmap reference: http://www.rikai.com/library/kanjitables/kanji_codes.sjis.shtml
                quote = jconv.convert(Buffer.from(bytes), 'SJIS', 'UTF8').toString('utf8');
            } else {
                for (let i = start; i < end - 1; i += 1) {
                    const quote_byte = data.getUint8(i);
                    quote += String.fromCharCode(
                        language.data.charmap
                            ? language.data.charmap[quote_byte]
                            : quote_byte,
                    );
                }
            }
            if (language.data.code === 'HEB') {
                quote = quote.trim().trimStart().trimEnd()
                quote = quote.replace(/\u0000/g, '');
                quote = quote.replace(/  /g, '');
            }
        } catch (err) {
            console.error(`Error reading text at index ${idx}: ${err}`);
        }
        texts.push({
            index: -1,
            type,
            entry_index: language.index,
            quote_index: idx,
            map_index: mapData[idx],
            quote,
            // quote: quote.replace(' @ ', '\n\n').replace('@', '\n\n'),
        });
        idx += 1;
    } while (end < data.byteLength);

    return texts;
}

function getLanguageText1Index(language, index) {
    const languageIndex = index + 28 * language.index;
    return { data: language, index: languageIndex };
}

export async function loadTexts1(language, index) {
    const folderPath = language.isFan
        ? path.normalize(`./data/Community/LBA1/${language.culture}/`)
        : path.normalize(`./data/Little Big Adventure/CommonClassic/`);
    const filename = `${folderPath}TEXT.HQR`;

    const file = fs.readFileSync(filename);
    if (file == null) {
        console.error(`File not found: ${filename}`);
        return null;
    }
    const textHqr = HQR.fromArrayBuffer(toArrayBuffer(file));

    return await loadTextData(
        'lba1',
        textHqr,
        getLanguageText1Index(language, index),
    );
}

function getLanguageText2Index(language, index) {
    const languageIndex = index + 30 * language.index;
    return { data: language, index: languageIndex };
}

export async function loadTexts2(language, index) {
    const folderPath = language.isFan
        ? path.normalize(`./data/Community/LBA2/${language.culture}/`)
        : path.normalize(`./data/Little Big Adventure 2/Common/`);
    const filename = `${folderPath}TEXT.HQR`;

    const file = fs.readFileSync(filename);
    if (file == null) {
        console.error(`File not found: ${filename}`);
        return null;
    }
    const textHqr = HQR.fromArrayBuffer(toArrayBuffer(file));

    return await loadTextData(
        'lba2',
        textHqr,
        getLanguageText2Index(language, index),
    );
}
