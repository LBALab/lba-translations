import fs from 'fs';

import Languages from './constants';
import { loadTexts1, loadTexts2 } from './text';
import { getMetadataForHQR } from './metadata';

const getCharmap = (charmap) => {
    const map = {};
    for (let i = 0; i < charmap.length; i += 1) {
        if (i !== charmap[i]) {
            map[i] = charmap[i];
        }
    }
    return map;
};

const convertLBA1 = async () => {
    const metadata = await getMetadataForHQR('LBA1', 'TEXT.HQR');

    for (let i = 0; i < Languages.LBA1.length; i += 1) {
        let index = 0;
        let entries = [];
        const language = Languages.LBA1[i];
        for (let j = 0; j < language.entries.length; j += 1) {
            const entry = {
                index: language.entries[j],
                metadata:
                    metadata?.entries[language.entries[j] + 1]?.description,
                texts: [],
            };
            try {
                entry.texts = await loadTexts1(language, language.entries[j]);
                if (entry.texts == null) {
                    continue;
                }
                entry.texts.forEach((t) => {
                    try {
                        t.index = index;
                        index += 1;
                    } catch (e) {
                        console.log(e);
                    }
                });
                entries.push(entry);
            } catch (e) {
                console.log(e);
            }
        }
        const quotes = {
            index: i,
            language: {
                code: language.code,
                name: language.name,
                culture: language.culture,
            },
            authors: language.authors,
            description: metadata.description,
            entries,
            charmap: getCharmap(language.charmap),
        };

        let json = JSON.stringify(quotes, null, 4);
        fs.writeFile(`LBA1/${language.culture}.json`, json, (err) => {
            if (err) throw err;
            console.log(`LBA1/${language.culture}.json file created.`);
        });
    }
};

const convertLBA2 = async () => {
    const metadata = await getMetadataForHQR('LBA2', 'TEXT.HQR');

    for (let i = 0; i < Languages.LBA2.length; i += 1) {
        let index = 0;
        let entries = [];
        const language = Languages.LBA2[i];
        if (language.skip) {
            continue;
        }
        for (let j = 0; j < language.entries.length; j += 1) {
            const entry = {
                index: language.index,
                metadata:
                    metadata?.entries[language.entries[j] + 1]?.description,
                texts: [],
            };
            try {
                entry.texts = await loadTexts2(language, language.entries[j]);
                if (entry.texts == null) {
                    continue;
                }
                entry.texts.forEach((t) => {
                    try {
                        t.index = index;
                        index += 1;
                    } catch (e) {
                        console.log(e);
                    }
                });
                entries.push(entry);
            } catch (e) {
                console.log(e);
            }
        }
        const quotes = {
            index: i,
            language: {
                code: language.code,
                name: language.name,
                culture: language.culture,
            },
            authors: language.authors,
            description: metadata.description,
            entries,
            charmap: getCharmap(language.charmap),
        };

        let json = JSON.stringify(quotes, null, 4);
        fs.writeFile(`LBA2/${language.culture}.json`, json, (err) => {
            if (err) throw err;
            console.log(`LBA2/${language.culture}.json file created.`);
        });
    }
};

const convert = async () => {
    await convertLBA1();
    await convertLBA2();
};

convert();
