import fs from 'fs';
import path from 'path';

import { HQR } from '@lbalab/hqr';

const toArrayBuffer = (b: Buffer) =>
    b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);

//  from https://gist.github.com/joni/3760795
// function fromUTF8Array(data) {
//     // array of bytes
//     var str = '',
//         i;

//     for (i = 0; i < data.length; i++) {
//         var value = data[i];

//         if (value < 0x80) {
//             str += String.fromCharCode(value);
//         } else if (value > 0xbf && value < 0xe0) {
//             str += String.fromCharCode(
//                 ((value & 0x1f) << 6) | (data[i + 1] & 0x3f),
//             );
//             i += 1;
//         } else if (value > 0xdf && value < 0xf0) {
//             str += String.fromCharCode(
//                 ((value & 0x0f) << 12) |
//                     ((data[i + 1] & 0x3f) << 6) |
//                     (data[i + 2] & 0x3f),
//             );
//             i += 2;
//         } else {
//             // surrogate pair
//             var charCode =
//                 (((value & 0x07) << 18) |
//                     ((data[i + 1] & 0x3f) << 12) |
//                     ((data[i + 2] & 0x3f) << 6) |
//                     (data[i + 3] & 0x3f)) -
//                 0x010000;

//             str += String.fromCharCode(
//                 (charCode >> 10) | 0xd800,
//                 (charCode & 0x03ff) | 0xdc00,
//             );
//             i += 3;
//         }
//     }

//     return str;
// }

// function toUTF8Array(str) {
//     var utf8 = [];
//     for (var i=0; i < str.length; i++) {
//         var charcode = str.charCodeAt(i);
//         if (charcode < 0x80) utf8.push(charcode);
//         else if (charcode < 0x800) {
//             utf8.push(0xc0 | (charcode >> 6),
//                       0x80 | (charcode & 0x3f));
//         }
//         else if (charcode < 0xd800 || charcode >= 0xe000) {
//             utf8.push(0xe0 | (charcode >> 12),
//                       0x80 | ((charcode>>6) & 0x3f),
//                       0x80 | (charcode & 0x3f));
//         }
//         // surrogate pair
//         else {
//             i++;
//             // UTF-16 encodes 0x10000-0x10FFFF by
//             // subtracting 0x10000 and splitting the
//             // 20 bits of 0x0-0xFFFFF into two halves
//             charcode = 0x10000 + (((charcode & 0x3ff)<<10)
//                       | (str.charCodeAt(i) & 0x3ff))
//             utf8.push(0xf0 | (charcode >>18),
//                       0x80 | ((charcode>>12) & 0x3f),
//                       0x80 | ((charcode>>6) & 0x3f),
//                       0x80 | (charcode & 0x3f));
//         }
//     }
//     return utf8;
// }

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
        for (let i = start; i < end - 1; i += 1) {
            quote += String.fromCharCode(
                language.data.charmap
                    ? language.data.charmap[data.getUint8(i)]
                    : data.getUint8(i),
            );
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
