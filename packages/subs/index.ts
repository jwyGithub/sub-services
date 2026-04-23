import type { Config, DefaultConfig, Node } from './src/types';
import { join } from 'node:path';
import process from 'node:process';
import { loadConfig, logger, mergeConfig } from '@sub-services/shared';
import { File } from './src/core/file';
import { ParserFactory } from './src/core/parser';
import { Process } from './src/core/process';
import { Storage } from './src/core/storage';
import { fetchSub } from './src/fetch';

function loadEnvConfig<T extends Config>() {
    const env = process.env.NODE_ENV || 'development';
    logger.info(`从 %s 配置文件中加载配置...`, env);
    const defaultConfig = loadConfig<Record<string, string>>('config/default.yaml', { parser: 'yaml' });
    let envConfig: Record<string, string> = {};

    if (env === 'production' && process.env.CONFIG) {
        envConfig = loadConfig(process.env.CONFIG, { parser: 'yaml' });
    } else {
        envConfig = loadConfig<Record<string, string>>('config/dev.yaml', { parser: 'yaml' });
    }
    const mergedConfig = mergeConfig<T>(defaultConfig, envConfig);
    logger.info('加载环境配置成功');
    return mergedConfig;
}

function loadSubsConfig(subs: Config['subs'], vpsConfig: Config['vps']) {
    return Object.entries(vpsConfig)
        .map(([, value]) => {
            return subs.map(sub => {
                const urlParams = new URLSearchParams(value.config);
                logger.info('加载 %s 协议订阅...', value.protocol);
                return {
                    protocol: value.protocol,
                    parser: value.parser,
                    sub: `${sub}?${urlParams.toString()}`
                };
            });
        })
        .flat();
}

async function main() {
    try {
        const file = new File(join(process.cwd(), 'address'));
        const config = loadEnvConfig<DefaultConfig & Config>();
        const storage = new Storage(config.storage);
        const processor = new Process(config);
        const vpsConfig = loadSubsConfig(config.subs, config.vps);
        logger.info('加载 vps 配置成功, %s', vpsConfig.length);
        const subs = await fetchSub(vpsConfig);
        await file.saveOriginalContent(subs);

        const allNodes: Node[] = [];
        for (const { protocol, content, success, parser } of subs) {
            if (!success) continue;

            logger.info('正在解析订阅: %s', protocol);
            try {
                const parserIns = ParserFactory.getParser(parser);
                const nodes = parserIns.parseContent(protocol, content);

                if (nodes.length > 0) {
                    logger.info('订阅 %s 解析到 %d 个 %s 节点', protocol, nodes.length, protocol.toUpperCase());
                    allNodes.push(...nodes);
                }
            } catch (error) {
                logger.debug('解析 %s 协议失败: %s', protocol.toUpperCase(), error);
            }
        }
        logger.info('所有订阅解析完成，共解析到 %d 个节点', allNodes.length);

        // 4. 处理节点（去重和过滤）
        const processedNodes = await processor.process(allNodes);

        // 5. 保存处理后的节点
        await storage.saveNodes(processedNodes);

        logger.info('订阅处理完成');
    } catch (error) {
        logger.error('程序运行失败: %s', error);
        process.exit(1);
    }
}

main();
