/**
 * The global constants
 */
const MEGABYTE = 1024 * 1024;
export const MAX_UPLOAD_FILE_SIZE_MB = 25;
export const MAX_UPLOAD_FILE_SIZE_BYTE = MAX_UPLOAD_FILE_SIZE_MB * MEGABYTE;
export const MORGAN_FORMAT = ':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" - :response-time ms';
export const DEFAULT_LANGUAGE = 'vi';

export const PLATFORM = {
  WEB: 'web',
  IOS: 'ios',
  ANDROID: 'android',
};

export const GROUP_CHAT = {
  SINGLE: 'single',
  GROUP: 'group'
}

export const MESSAGE_HIDE = "Tin nhắn đã bị xóa"
