import { writeFileSync, readdirSync, readFileSync, statSync } from 'fs';
import path from 'path';
import asyncLib from 'async';
import Zip from 'jszip';
export const zipWrite = async (rootDir, options = { maxOpenFiles: 500 }) => {
    const buffer = await zipBuffer(rootDir, options);
    if (options.saveTo)
        writeFileSync(options.saveTo, buffer, { encoding: 'binary' });
    return buffer;
};
const zip = new Zip();
export const zipBuffer = async (rootDir, options) => {
    const folders = {};
    const fileQueue = generateFileQueue(folders, options);
    // Resolve the path so we can remove trailing slash if provided
    rootDir = path.resolve(rootDir);
    folders[rootDir] = zip;
    await dive(rootDir, options, folders, fileQueue);
    const buffer = await zip.generateAsync({
        compression: 'DEFLATE',
        type: 'nodebuffer'
    });
    return buffer;
};
const generateFileQueue = (folders, options) => asyncLib.queue((task, callback) => {
    const data = readFileSync(task.fullPath);
    if (options.each) {
        options.each(path.join(task.dir, task.file));
    }
    folders[task.dir].file(task.file, data);
    callback(null);
}, options.maxOpenFiles);
const addItem = async (fullPath, options, folders, fileQueue) => {
    const stat = statSync(fullPath);
    if (options.filter && !options.filter(fullPath, stat))
        return;
    const dir = path.dirname(fullPath);
    const file = path.basename(fullPath);
    let parentZip;
    if (stat.isDirectory()) {
        parentZip = folders[dir];
        if (options.each) {
            options.each(fullPath);
        }
        const newZip = parentZip.folder(file);
        folders[fullPath] = newZip;
        await dive(fullPath, options, folders, fileQueue);
    }
    else {
        await fileQueue.push({ fullPath, dir, file });
    }
};
const dive = async (dir, options, folders, fileQueue) => {
    const files = readdirSync(dir);
    if (!files.length)
        return;
    for (const file of files) {
        const fullPath = path.resolve(dir, file);
        await addItem(fullPath, options, folders, fileQueue);
    }
};