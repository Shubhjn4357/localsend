// Quick update script
const fs = require('fs');
const path = require('path');

const updates = {
    'fr.json': { selectFiles: 'Sélectionner des fichiers', selectFilesFirst: 'Veuillez sélectionner des fichiers avant de choisir un appareil' },
    'de.json': { selectFiles: 'Dateien auswählen', selectFilesFirst: 'Bitte wählen Sie zuerst Dateien aus, bevor Sie ein Gerät auswählen' },
    'pt.json': { selectFiles: 'Selecionar Arquivos', selectFilesFirst: 'Por favor selecione arquivos antes de escolher um dispositivo' },
    'zh.json': { selectFiles: '选择文件', selectFilesFirst: '请先选择文件，然后选择设备' },
    'ja.json': { selectFiles: 'ファイルを選択', selectFilesFirst: 'デバイスを選択する前にファイルを選択してください' },
    'hi.json': { selectFiles: 'फ़ाइलें चुनें', selectFilesFirst: 'कृपया डिवाइस चुनने से पहले फ़ाइलें चुनें' }
};

Object.entries(updates).forEach(([file, keys]) => {
    const filePath = path.join(__dirname, 'src', 'i18n', 'locales', file);
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    data.send = { ...data.send, ...keys };
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    console.log(`Updated ${file}`);
});
