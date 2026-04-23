import type { Node, Protocol } from '../types';
import { tryUrlDecode } from 'cloudflare-tools';
import { formatPs } from '../utils';
import { BaseParser } from './base';

export class VlessParser extends BaseParser {
    constructor() {
        super('vless');
    }

    parseLine(protocol: Protocol, line: string): Node {
        try {
            // 解析 URL
            const url = new URL(line);

            return {
                protocol,
                host: url.hostname,
                port: url.port,
                hash: formatPs(tryUrlDecode(url.hash))
            };
        } catch (error) {
            throw new Error(`解析 Vless 配置失败: ${error}`);
        }
    }
}
