export function diacriticSensitiveRegex(string = '') {
  return string.toLowerCase().replace(/a/g, '[a,á,à,ã,ả,ạ,ä,ă,ắ,ằ,ẵ,ẳ,ặ,â,ấ,ầ,ẫ,ẩ,ậ]')
    .replace(/e/g, '[e,è,é,ẹ,ẻ,ẽ,ê,ề,ế,ệ,ể,ễ]')
    .replace(/i/g, '[i,ì,í,ị,ỉ,ĩ,ï]')
    .replace(/o/g, '[o,ò,ó,ọ,ỏ,õ,ô,ồ,ố,ộ,ổ,ỗ,ơ,ờ,ớ,ợ,ở,ỡ]')
    .replace(/u/g, '[u,ù,ú,ụ,ủ,ũ,ư,ừ,ứ,ự,ử,ữ]')
    .replace(/y/g, '[y,ỳ,ý,ỷ,ỹ]')
    .replace(/d/g, '[d,đ]');
}
