import path from 'node:path';
import type { Config } from './config';

/**
 * Get the base directory for tsconfig
 */
function getTsconfigBaseDir(
  config: Pick<Config, 'tsconfig' | 'tsconfigRoot'>,
): string {
  return config.tsconfig ? path.dirname(config.tsconfig) : config.tsconfigRoot;
}

/**
 * Convert an absolute file path to a path relative to the tsconfig base directory
 */
export function getRelativePathFromTsconfig(
  absolutePath: string,
  config: Pick<Config, 'tsconfig' | 'tsconfigRoot'>,
): string {
  const baseDir = getTsconfigBaseDir(config);
  return path.relative(baseDir, absolutePath);
}

/**
 * Check if a file is within the tsconfig scope
 */
export function isInTsconfigScope(
  absolutePath: string,
  config: Pick<Config, 'tsconfig' | 'tsconfigRoot'>,
): boolean {
  const relativePath = getRelativePathFromTsconfig(absolutePath, config);
  return !relativePath.startsWith('..');
}
