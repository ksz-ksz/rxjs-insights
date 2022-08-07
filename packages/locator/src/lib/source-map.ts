// @ts-ignore
import mappingsWasm from './mappings.wasm';
import { RawSourceMap, SourceMapConsumer } from 'source-map';

let initialized = false;

export function initSourceMapConsumer(): void {
  if (!initialized) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call,@typescript-eslint/no-unsafe-member-access
    (SourceMapConsumer as any).initialize({
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
      'lib/mappings.wasm': mappingsWasm.buffer,
    });
    initialized = true;
  }
}

async function resolveSourceMapUrl(sourceUrl: string): Promise<string> {
  const sourceResponse = await fetch(sourceUrl);

  const sourceMapHeader = sourceResponse.headers.get('SourceMap');
  if (sourceMapHeader) {
    return sourceMapHeader;
  }

  const xSourceMapHeader = sourceResponse.headers.get('X-SourceMap');
  if (xSourceMapHeader) {
    return xSourceMapHeader;
  }

  const source = await sourceResponse.text();
  const sourceMappingUrlPattern = /^\/\/[@#] ?sourceMappingURL=([^\s]+)$/gm;
  let sourceMappingUrl = `${sourceUrl}.map`;
  while (true) {
    const match = sourceMappingUrlPattern.exec(source);
    if (match !== null) {
      sourceMappingUrl = match[1];
    } else {
      return sourceMappingUrl;
    }
  }
}

async function getSourceMapUrl(sourceUrl: string): Promise<string> {
  const sourceMappingUrl = await resolveSourceMapUrl(sourceUrl);
  return new URL(sourceMappingUrl, sourceUrl).href;
}

async function getSourceMap(
  sourceMappingUrl: string
): Promise<RawSourceMap | undefined> {
  try {
    const sourceMappingResponse = await fetch(sourceMappingUrl);
    return (await sourceMappingResponse.json()) as RawSourceMap;
  } catch (e) {
    return undefined;
  }
}

const sourceMapConsumersCache: Record<
  string,
  Promise<SourceMapConsumer | undefined>
> = {};

async function resolveSourceMapConsumer(
  sourceUrl: string
): Promise<SourceMapConsumer | undefined> {
  const sourceMappingUrl = await getSourceMapUrl(sourceUrl);
  const sourceMap = await getSourceMap(sourceMappingUrl);
  return sourceMap !== undefined
    ? await new SourceMapConsumer(sourceMap, sourceMappingUrl)
    : undefined;
}

export function getSourceMapConsumer(
  sourceUrl: string
): Promise<SourceMapConsumer | undefined> {
  if (sourceMapConsumersCache.hasOwnProperty(sourceUrl)) {
    return sourceMapConsumersCache[sourceUrl];
  } else {
    const sourceMapConsumerPromise = resolveSourceMapConsumer(sourceUrl);
    sourceMapConsumersCache[sourceUrl] = sourceMapConsumerPromise;
    return sourceMapConsumerPromise;
  }
}

export const GREATEST_LOWER_BOUND = SourceMapConsumer.GREATEST_LOWER_BOUND;
export const LEAST_UPPER_BOUND = SourceMapConsumer.LEAST_UPPER_BOUND;
