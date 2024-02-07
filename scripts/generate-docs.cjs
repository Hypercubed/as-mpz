const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');
const extract = require('parse-comments');

const SOURCE_PATH = '../assembly/';
const TARGET_PATH = '../docs/api/';

const files = ['index.ts'];

files
  .map(file => {
    const str = read(file);
    const comments = extract(str);
    const md = process(file, comments);
    write(md, file.replace('.ts', '.md'));
  })
  .join('\n');

function processContent(content) {
  return (
    content.replaceAll('@returns', 'Returns').replaceAll('@throws', 'Throws') +
    '\n'
  );
}

function process(_, comments) {
  return comments.map(c => processContent(c.comment.content)).join('\n');
}

function read(fp) {
  fp = join(__dirname, SOURCE_PATH, fp);
  console.log('Reading', fp);
  return readFileSync(fp, 'utf8');
}

function write(data, fp) {
  fp = join(__dirname, TARGET_PATH, fp);
  console.log('Writing', fp);
  return writeFileSync(fp, data, 'utf8');
}
