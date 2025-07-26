import path from 'node:path';
import type { Config } from './config';

/**
 * Get the base directory for tsconfig
 */
export function getTsconfigBaseDir(config: Pick<Config, 'tsconfig' | 'tsconfigRoot'>): string {
  return config.tsconfig ? path.dirname(config.tsconfig) : config.tsconfigRoot;
}

/**
 * Convert an absolute file path to a path relative to the tsconfig base directory
 * @returns null if the file is outside the tsconfig scope
 */
export function getRelativePathFromTsconfig(
  absolutePath: string,
  config: Pick<Config, 'tsconfig' | 'tsconfigRoot'>
): string | null {
  const baseDir = getTsconfigBaseDir(config);
  const relativePath = path.relative(baseDir, absolutePath);
  
  // Files outside tsconfig scope have relative paths starting with '..'
  if (relativePath.startsWith('..')) {
    return null;
  }
  
  return relativePath;
}

/**
 * Check if a file is within the tsconfig scope
 */
export function isInTsconfigScope(
  absolutePath: string,
  config: Pick<Config, 'tsconfig' | 'tsconfigRoot'>
): boolean {
  return getRelativePathFromTsconfig(absolutePath, config) !== null;
}

/**
 * Filter an array of file paths to only include those within the tsconfig scope
 */
export function filterFilesInTsconfigScope(
  filePaths: string[],
  config: Pick<Config, 'tsconfig' | 'tsconfigRoot'>
): string[] {
  return filePaths.filter(filePath => isInTsconfigScope(filePath, config));
}

/**
 * Convert file paths to relative paths from tsconfig base directory
 * Only includes files within the tsconfig scope
 */
export function convertToRelativePathsFromTsconfig(
  filePaths: string[],
  config: Pick<Config, 'tsconfig' | 'tsconfigRoot'>
): string[] {
  return filePaths
    .map(filePath => getRelativePathFromTsconfig(filePath, config))
    .filter((relativePath): relativePath is string => relativePath !== null);
}