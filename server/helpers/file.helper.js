import execa from 'execa';
import logger from '../api/logger';

/**
 * Remove local file on server with filePath
 * @param filePath
 */
export function removeFile(filePath) {
  const removeCmd = `rm ${filePath}`;
  try {
    execa.command(removeCmd);
  } catch (error) {
    logger.error('removeFile execa error:', error);
    logger.error('removeFile execa error, filePath:', filePath);
  }
}

export const GetFileData = (shareHost, file) => {
  return {
    name: file.name,
    large: shareHost + "/lg/" + file?.large || '',
    medium: shareHost + "/md/" + file?.medium || '',
    small: shareHost + "/sm/" + file?.small || '',
  }
}
