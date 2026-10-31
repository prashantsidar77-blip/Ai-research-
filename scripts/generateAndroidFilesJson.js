import fs from 'fs';
import path from 'path';

const baseDir = path.resolve(process.cwd(), 'src/android_source');

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);
    if (fs.statSync(fullPath).isDirectory()) {
      arrayOfFiles = getAllFiles(fullPath, arrayOfFiles);
    } else {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

const filePaths = getAllFiles(baseDir);
const filesData = filePaths.map((fp) => {
  const relativePath = path.relative(baseDir, fp).replace(/\\/g, '/');
  const content = fs.readFileSync(fp, 'utf8');
  let lang = 'kotlin';
  if (relativePath.endsWith('.xml')) lang = 'xml';
  else if (relativePath.endsWith('.kts') || relativePath.endsWith('.gradle')) lang = 'kotlin';
  else if (relativePath.endsWith('.pro')) lang = 'properties';
  else if (relativePath.endsWith('.properties')) lang = 'properties';
  else if (relativePath.endsWith('.yml') || relativePath.endsWith('.yaml')) lang = 'yaml';
  else if (relativePath.endsWith('.md')) lang = 'markdown';
  else if (relativePath.endsWith('.sh') || relativePath === 'gradlew') lang = 'bash';

  return {
    path: relativePath,
    content,
    language: lang,
    size: content.length,
  };
});

const output = `export interface AndroidFileRecord {
  path: string;
  content: string;
  language: string;
  size: number;
}

export const ANDROID_FILES: AndroidFileRecord[] = ${JSON.stringify(filesData, null, 2)};
`;

fs.writeFileSync(path.resolve(process.cwd(), 'src/androidFilesData.ts'), output);
console.log('Generated src/androidFilesData.ts with', filesData.length, 'files');
