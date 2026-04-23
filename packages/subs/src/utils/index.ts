import crypto from 'node:crypto';

export function formatPs(ps?: string): string {
    if (!ps) return crypto.randomUUID();

    return ps.replace(/\|/g, '-');
}
