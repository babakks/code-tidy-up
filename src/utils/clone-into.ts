import { isObject } from "util";

export function cloneInto(x: any, y: any): void {
  const keys = Object.keys(x);

  keys.forEach(k => {
    if (isObject(x[k])) {
      y[k] = {};
      cloneInto(x[k], y[k]);
    } else {
      y[k] = x[k];
    }
  });
}
