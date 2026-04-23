import type { BaseParser } from '../parser/base';
import type { Parser, Protocol } from '../types';
import { SsParser } from '../parser/ss';
import { TrojanParser } from '../parser/trojan';
import { VlessParser } from '../parser/vless';
import { VmessParser } from '../parser/vmess';

export class ParserFactory {
    private static parsers = new Map<Protocol, BaseParser>([
        ['vmess', new VmessParser()],
        ['vless', new VlessParser()],
        ['trojan', new TrojanParser()],
        ['ss', new SsParser()]
    ] as const);

    static getParser(parser: Parser): BaseParser {
        const parserIns = this.parsers.get(parser);
        if (!parserIns) {
            throw new Error(`No parser found for parser: ${parser}`);
        }
        return parserIns;
    }
}
