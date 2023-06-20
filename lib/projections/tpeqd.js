import adjust_lon from '../common/adjust_lon';
import {R2D, HALF_PI} from '../constants/values';

// SOURCE:
// https://github.com/OSGeo/PROJ/blob/master/src/projections/tpeqd.cpp

export function init() {
  if (this.lon1 === undefined) {
    this.lon1 = 0;
  }
  if (this.lon2 === undefined) {
    this.lon2 = 0;
  }
  if (this.lat1 === undefined) {
    this.lat1 = 0;
  }
  if (this.lat2 === undefined) {
    this.lat2 = 0;
  }

  this.lam0 = adjust_lon(0.5 * (this.lon1 + this.lon2));
  this.dlam2 = adjust_lon(this.lon2 - this.lon1);

  this.cp1 = Math.cos(this.lat1);
  this.cp2 = Math.cos(this.lat2);
  this.sp1 = Math.sin(this.lat1);
  this.sp2 = Math.sin(this.lat2);

  this.cs = this.cp1 * this.sp2;
  this.sc = this.sp1 * this.cp2;
  this.ccs = this.cp1 * this.cp2 * Math.sin(this.dlam2);
  this.z02 = Math.acos(this.sp1 * this.sp2 + this.cp1 * this.cp2 * Math.cos(this.dlam2));

  if (this.z02 === 0.0) {
    throw new Error('Invalid value for lat_1 and lat_2: their absolute value should be <90°.');
  }

  this.hz0 = 0.5 * this.z02;

  var A12 = Math.atan2(
    this.cp2 * Math.sin(this.dlam2),
    this.cp1 * this.sp2 - this.sp1 * this.cp2 * Math.cos(this.dlam2)
  );
  var pp = Math.asin(this.cp1 * Math.sin(A12));

  this.ca = Math.cos(pp);
  this.sa = Math.sin(pp);
  this.lp = adjust_lon(Math.atan2(this.cp1 * Math.cos(A12), this.sp1) - this.hz0);
  this.dlam2 *= 0.5;
  this.lamc = HALF_PI - Math.atan2(
    Math.sin(A12) * this.sp1,
    Math.cos(A12)
  ) - this.dlam2;
  this.thz0 = Math.tan(this.hz0);
  this.rhshz0 = 0.5 / Math.sin(this.hz0);
  this.r2z0 = 0.5 / this.z02;
  this.z02 *= this.z02;
}

/* two-point equidistant forward equations--mapping lat,long to x,y
  ---------------------------------------------------------------*/

export function forward(p) {
  var lng = p.x;  // lambda
  var lat = p.y;  // phi

  // convert to degrees, check extent
  if (lat * R2D > 90 && lat * R2D < -90 && lng * R2D > 180 && lng * R2D < -180) {
    return null;
  }

  var x, y;
  var dl1 = lng + this.dlam2;
  var dl2 = lng - this.dlam2;

  var sp = Math.sin(lat);
  var cp = Math.cos(lat);
  var z1 = Math.acos(this.sp1 * sp + this.cp1 * cp * Math.cos(dl1));
  var z2 = Math.acos(this.sp2 * sp + this.cp2 * cp * Math.cos(dl2));
  z1 *= z1;
  z2 *= z2;

  var t = z1 - z2;
  x = this.r2z0 * t;
  t = this.z02 - t;
  var under_root = 4 * this.z02 * z2 - t * t;
  y = this.r2z0 * (under_root < 0 ? 0 : Math.sqrt(under_root));
  if ((this.ccs * sp - cp * (this.cs * Math.sin(dl1) - this.sc * Math.sin(dl2))) < 0) {
    y *= -1;
  }

  p.x = x * this.a;
  p.y = y * this.a;
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
