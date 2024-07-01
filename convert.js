const fs = require('fs-extra');
const path = require('path');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// 指定要處理的資料夾
const inputFolder = './html-files';
const outputFolder = './txt-files';

// 確保輸出資料夾存在
fs.ensureDirSync(outputFolder);

// 獲取所有 HTML 檔案
fs.readdir(inputFolder, (err, files) => {
    if (err) {
        console.error('Error reading input folder:', err);
        return;
    }

    files.forEach(file => {
        const filePath = path.join(inputFolder, file);
        if (path.extname(file) === '.html') {
            convertHtmlToTxt(filePath);
        }
    });
});

// 轉換 HTML 檔案為 TXT
function convertHtmlToTxt(filePath) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading file:', filePath, err);
            return;
        }

        const dom = new JSDOM(data);
        const document = dom.window.document;
        const textContent = extractTextWithLineBreaks(document.body);

        const outputFilePath = path.join(outputFolder, path.basename(filePath, '.html') + '.txt');
        fs.writeFile(outputFilePath, textContent, err => {
            if (err) {
                console.error('Error writing file:', outputFilePath, err);
                return;
            }
            console.log('Converted', filePath, 'to', outputFilePath);
        });
    });
}

// 提取文本內容並保留換行符
function extractTextWithLineBreaks(element) {
    let text = '';
    element.childNodes.forEach(node => {
        if (node.nodeType === 3) { // Text node
            text += node.textContent;
        } else if (node.nodeType === 1) { // Element node
            if (node.tagName === 'BR' || node.tagName === 'P') {
                text += '\n';
            }
            text += extractTextWithLineBreaks(node);
        }
    });
    return text;
}
