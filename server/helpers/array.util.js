/**
 * Get the common value from 2 arrays
 * @param arr1
 * @param arr2
 * @returns {*[]}
 */
export function getMergeCommon(arr1, arr2) {
  return [...arr1.filter(x => !arr2.includes(x)), ...arr2];
}
