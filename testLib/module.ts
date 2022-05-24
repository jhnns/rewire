import * as fs from 'fs';

export function readFileSync(path: string) {
    return fs.readFileSync(path);
}
