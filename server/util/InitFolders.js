import execa from 'execa';
import fs from 'fs';
// import {USER_AVATAR_DESTINATION} from '../components/user/user.multer';
import logger from '../api/logger';

// export function initUserAvatarFolder() {
//   try {
//     if (!fs.existsSync(USER_AVATAR_DESTINATION)) {
//       execa.commandSync(`mkdir -p ${USER_AVATAR_DESTINATION}`);
//     }
//   } catch (error) {
//     logger.error('initUserAvatarFolder error');
//     logger.error(error.message);
//   }
// }

export default function initUploadFolders() {
  // initUserAvatarFolder();
}
