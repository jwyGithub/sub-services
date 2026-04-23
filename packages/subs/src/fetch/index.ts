import type { Parser, Protocol } from '../types';
import { logger } from '@sub-services/shared';
import { fetchWithRetry } from 'cloudflare-tools';

export async function fetchSub(vpsConfig: { protocol: Protocol; sub: string; parser: Parser }[]) {
    try {
        const subs: { protocol: Protocol; content: string; success: boolean; parser: Parser }[] = [];
        for await (const vps of vpsConfig) {
            const response = await fetchWithRetry(vps.sub, {
                onRetry(attempt, delay) {
                    logger.warn('订阅 %s 重试 %d 次, 等待 %d 秒', vps.sub, attempt, delay);
                }
            });
            if (!response.ok) {
                logger.error('订阅 %s 失败, 状态码: %d', vps.sub, response.status);
                subs.push({
                    protocol: vps.protocol,
                    content: '',
                    success: false,
                    parser: vps.parser
                });
                continue;
            }
            const data = await response.data.text();
            logger.info('订阅 %s 成功', vps.sub);
            subs.push({
                protocol: vps.protocol,
                content: data,
                success: true,
                parser: vps.parser
            });
        }
        return subs;
    } catch (error) {
        logger.error('订阅失败: %s', error);
        throw error;
    }
}
