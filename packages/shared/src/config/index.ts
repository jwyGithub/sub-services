import { existsSync, readFileSync } from 'node:fs';
import yaml from 'js-yaml';
import { merge } from 'lodash-es';

export function loadConfig<T>(filePath: string, options: { parser: 'yaml' | 'json' } = { parser: 'json' }): T {
    try {
        if (!existsSync(filePath)) {
            throw new Error(`Config file not found: ${filePath}`);
        }
        const { parser = 'json' } = options;
        const getFileContent = () => {
            try {
                return readFileSync(filePath, 'utf8');
            } catch {
                return filePath;
            }
        };

        if (parser === 'yaml') {
            return yaml.load(getFileContent()) as unknown as T;
        }

        if (parser === 'json') {
            return JSON.parse(getFileContent()) as unknown as T;
        }

        return getFileContent() as unknown as T;
    } catch (error) {
        throw new Error(`Failed to load config file ${filePath}: ${error}`);
    }
}

export function mergeConfig<T>(...configs: Record<string, string>[]): T {
    return configs.reduce((acc, config) => merge(acc, config), {} as T);
}
