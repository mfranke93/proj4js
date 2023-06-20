export function init() {
  // TODO
}

/* two-point equidistant forward equations--mapping lat,long to x,y
  ---------------------------------------------------------------*/

export function forward(p) {
  // TODO
  return p;
}

/* two-point equidistant inverse equations--mapping x,y to lat/long
  ---------------------------------------------------------------*/
export function inverse(p) {
  // TODO
  return p;
}

export var names = ["Two Point Equidistant", "tpeqd"];
export default {
  init: init,
  forward: forward,
  inverse: inverse,
  names: names
};
