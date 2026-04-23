export type Protocol = 'vmess' | 'vless' | 'trojan' | 'ss' | 'ssr' | 'hysteria' | 'hysteria2';
export type Parser = 'vmess' | 'vless' | 'trojan' | 'ss';

export interface DefaultConfig {
    storage: {
        base_path: string;
        files: {
            vless: string;
            vmess: string;
            trojan: string;
            ssr: string;
            ss: string;
            hysteria: string;
            hysteria2: string;
            all: string;
        };
    };
    filter: {
        patterns: string[];
        countryCodes: string[];
    };
}

export interface Config {
    subs: string[];
    vps: Record<
        Protocol,
        {
            protocol: Protocol;
            parser: Parser;
            config: Record<string, string>;
        }
    >;
}

export interface Node {
    protocol: Protocol;
    host: string;
    port: string;
    hash: string;
}
