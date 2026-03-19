/**
 * Move schema contract for future rule modules.
 *
 * @typedef {Object} Move
 * @property {string} pieceId
 * @property {string} from
 * @property {string} to
 * @property {string=} action
 */

/**
 * Placeholder validator to keep caller API stable.
 * Can be replaced with full rule validation later.
 * @param {Move} _move
 * @returns {boolean}
 */
export function isMoveShapeValid(_move) {
  return Boolean(_move?.pieceId && _move?.from && _move?.to);
}
