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
    console.log('LBA1:');
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

const convertLBA1Pot = async () => {
    const metadata = await getMetadataForHQR('LBA1', 'TEXT.HQR');
    console.log('LBA1:');
    let pot = '';
    for (let i = 0; i < Languages.LBA1.length; i += 1) {
        let index = 0;
        const language = Languages.LBA1[i];
        if (language.culture != 'en-GB') {
            continue;
        }
        
        pot = '';
        pot = pot.concat(`# Little Big Adventure 1 language file
# Copyright (C) 2023 ScummVM Team
# This file is distributed under the same license as the ScummVM package.
# Alexandre Fontoura, 2023.
#
msgid ""
msgstr ""\n`);
        
        const date = new Date().toISOString().replace('T', ' ').substring(0, 19);

        pot = pot.concat('Project-Id-Version: twine\n');
        pot = pot.concat('Report-Msgid-Bugs-To: scummvm-devel@lists.scummvm.org\n');
        pot = pot.concat(`POT-Creation-Date: ${date}\n`);
        pot = pot.concat(`PO-Revision-Date: ${date}\n`);
        pot = pot.concat(`Last-Translator: ${language.authors[0]}\n`);
        pot = pot.concat(`Language-Team: ${language.name} <https://translations.scummvm.org/projects/twine/lba1/${language.culture}/>\n`);
        pot = pot.concat(`Language: ${language.culture}\n`);
        pot = pot.concat('MIME-Version: 1.0\n');
        pot = pot.concat('Content-Type: text/plain; charset=UTF-8\n');
        pot = pot.concat('X-Generator: Weblate 4.4\n');

        for (let j = 0; j < language.entries.length; j += 1) {
            const meta = metadata?.entries[language.entries[j] + 1]?.description.split(':')[1].trim();

            try {
                const texts = await loadTexts1(language, language.entries[j]);
                if (texts == null) {
                    continue;
                }
                texts.forEach((t) => {
                    try {
                        t.index = index;
                        index += 1;
                    } catch (e) {
                        console.log(e);
                    }
                });

                for (let k = 0; k < texts.length; k += 1) {
                    const quote = texts[k].quote.replace(/@/g, '|').replace(/"/g, '\\"');
                    const new_index = language.entries[j] + 1 + 30 * language.new_index;
                    pot = pot.concat(`\n# ${new_index}:${meta}\n`);
                    pot = pot.concat(`#: ${new_index}:${texts[k].quote_index}\n`);
                    pot = pot.concat(`msgid "${quote}"\n`);
                    pot = pot.concat(`msgstr ""\n`);
                }
                
            } catch (e) {
                console.log(e);
            }
        }

        fs.writeFile(`LBA1/twine-lba1.pot`, pot, (err) => {
            if (err) throw err;
            console.log(`LBA1/twine-lba1.pot file created.`);
        });
    }
};


const convertLBA1Po = async () => {
    const metadata = await getMetadataForHQR('LBA1', 'TEXT.HQR');
    console.log('LBA1:');
    let po = '';
    for (let i = 0; i < Languages.LBA1.length; i += 1) {
        let index = 0;
        const language = Languages.LBA1[i];

        po = '';
        po = po.concat(`# Little Big Adventure 1 language file
# Copyright (C) 2023 ScummVM Team
# This file is distributed under the same license as the ScummVM package.
# Alexandre Fontoura, 2023.
#
msgid ""
msgstr ""\n`);

        const date = new Date().toISOString().replace('T', ' ').substring(0, 19);

        po = po.concat('Project-Id-Version: twine\n');
        po = po.concat('Report-Msgid-Bugs-To: scummvm-devel@lists.scummvm.org\n');
        po = po.concat(`POT-Creation-Date: ${date}\n`);
        po = po.concat(`PO-Revision-Date: ${date}\n`);
        po = po.concat(`Last-Translator: ${language.authors[0]}\n`);
        po = po.concat(`Language-Team: ${language.name} <https://translations.scummvm.org/projects/twine/lba1/${language.culture}/>\n`);
        po = po.concat(`Language: ${language.culture}\n`);
        po = po.concat('MIME-Version: 1.0\n');
        po = po.concat('Content-Type: text/plain; charset=UTF-8\n');
        po = po.concat('X-Generator: Weblate 4.4\n');
        
        for (let j = 0; j < language.entries.length; j += 1) {
            const meta = metadata?.entries[language.entries[j] + 1]?.description.split(':')[1].trim();

            try {
                const texts = await loadTexts1(language, language.entries[j]);
                const english_texts = await loadTexts1(Languages.LBA1[0], language.entries[j]);
                if (texts == null) {
                    continue;
                }
                texts.forEach((t) => {
                    try {
                        t.index = index;
                        index += 1;
                    } catch (e) {
                        console.log(e);
                    }
                });

                for (let k = 0; k < texts.length; k += 1) {
                    const english_quote = english_texts[k].quote.replace(/@/g, '|').replace(/"/g, '\\"');
                    const quote = texts[k].quote.replace(/@/g, '|').replace(/"/g, '\\"');
                    const new_index = language.entries[j] + 1 + 28 * language.new_index;
                    po = po.concat(`\n# ${new_index}:${meta}\n`);
                    po = po.concat(`#: ${new_index}:${texts[k].quote_index}\n`);
                    po = po.concat(`msgid "${english_quote}"\n`);
                    po = po.concat(`msgstr "${quote}"\n`);
                }
                
            } catch (e) {
                console.log(e);
            }
        }

        fs.writeFile(`LBA1/${language.culture}.po`, po, (err) => {
            if (err) throw err;
            console.log(`LBA1/${language.culture}.po file created.`);
        });
    }
};

const convertLBA2 = async () => {
    const metadata = await getMetadataForHQR('LBA2', 'TEXT.HQR');
    console.log('LBA2:');
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
    // await convertLBA1Pot();
    // await convertLBA1Po();

    // await convertLBA2();
};

convert();
