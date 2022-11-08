import { promisify } from 'util';
import { exec } from 'child_process';

import isWin from './isWin';

function execAsync(command: string) { return promisify(exec)(command, isWin ? { shell: 'powershell.exe' } : {}); }
export default execAsync;
