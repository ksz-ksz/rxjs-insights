import { safeDecode } from './safe-decode';
import { Encoder, EncoderResult } from './encoder';
import { createUrlParams, UrlParams } from './url-params';

function decodedUrlParams(input: string) {
  const entries: [string, string][] = [];
  for (const pair of input.split('&')) {
    const [key, val] = pair.split('=');
    const decodedKey = key !== undefined ? safeDecode(key) : '';
    const decodedVal = val !== undefined ? safeDecode(val) : '';
    entries.push([decodedKey, decodedVal]);
  }
  return createUrlParams(...entries);
}

function encodeUrlParams(input: UrlParams) {
  const pairs: string[] = [];
  for (const [key, val] of input) {
    const encodedKey = encodeURIComponent(key);
    const encodedVal = encodeURIComponent(val);
    pairs.push(`${encodedKey}=${encodedVal}`);
  }
  return pairs.join('&');
}

export class UrlParamsEncoder implements Encoder<string, UrlParams> {
  decode(input: string): EncoderResult<UrlParams> {
    return { valid: true, value: decodedUrlParams(input) };
  }

  encode(input: UrlParams): EncoderResult<string> {
    return { valid: true, value: encodeUrlParams(input) };
  }
}
