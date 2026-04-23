import type { Node, Protocol } from '../types';
import { tryBase64Decode, tryUrlDecode } from 'cloudflare-tools';
import { formatPs } from '../utils';
import { BaseParser } from './base';

export class VmessParser extends BaseParser {
    constructor() {
        super('vmess');
    }

    parseLine(protocol: Protocol, line: string): Node {
        try {
            const _sub = line.replace('vmess://', '');
            const config = JSON.parse(tryBase64Decode(_sub));
            return {
                protocol,
                host: config.add,
                port: config.port.toString(),
                hash: `#${formatPs(tryUrlDecode(config.ps))}`
            };
        } catch (error) {
            throw new Error(`解析 Vmess 配置失败: ${error}`);
        }
    }
}
