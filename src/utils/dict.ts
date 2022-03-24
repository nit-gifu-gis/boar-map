
export const deepClone = (obj: { [x: string]: any; }) => {
  const r = {};
  for (const name in obj) {
    if (isObject(obj[name])) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      r[name] = deepClone(obj[name]);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      r[name] = obj[name];
    }
  }
  return r;
};

// Array
export const isArray = (item: any) => {
  return Object.prototype.toString.call(item) === '[object Array]';
};

// OBJECT
export const isObject = (item: null) => {
  return typeof item === 'object' && item !== null && !isArray(item);
};
