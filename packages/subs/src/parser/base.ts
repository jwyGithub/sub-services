import type { Node, Protocol } from '../types';
import { logger } from '@sub-services/shared';
import { tryBase64Decode } from 'cloudflare-tools';

export abstract class BaseParser {
    protected protocol: Protocol;

    constructor(protocol: Protocol) {
        this.protocol = protocol;
    }

    /**
     * 解析单个节点
     * @param line 节点配置行
     */
    abstract parseLine(protocol: Protocol, line: string): Node;

    parseContent(protocol: Protocol, content: string): Node[] {
        try {
            // 解码订阅内容
            const decodedContent = tryBase64Decode(content);

            // 按行分割
            const lines = decodedContent.split('\n').filter(line => line.trim());

            const nodes: Node[] = [];

            // 解析每一行
            for (const line of lines) {
                try {
                    if (this.canParse(line)) {
                        const node = this.parseLine(protocol, line);
                        nodes.push(node);
                    }
                } catch (error) {
                    logger.warn({ line, error }, '解析节点失败');
                }
            }

            return nodes;
        } catch (error) {
            logger.error({ error }, '解析订阅内容失败');
            throw new Error(`解析订阅内容失败: ${error}`);
        }
    }

    /**
     * 检查是否可以解析该行
     * @param line 配置行
     */
    protected canParse(line: string): boolean {
        return line.toLowerCase().startsWith(`${this.protocol}://`);
    }
}
