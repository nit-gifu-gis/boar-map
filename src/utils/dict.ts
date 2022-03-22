export const deepClone = (obj) => {
  const r = {};
  for (const name in obj) {
    if (isObject(obj[name])) {
      r[name] = deepClone(obj[name]);
    } else {
      r[name] = obj[name];
    }
  }
  return r;
};

// Array
export const isArray = (item) => {
  return Object.prototype.toString.call(item) === '[object Array]';
};

// OBJECT
export const isObject = (item) => {
  return typeof item === 'object' && item !== null && !isArray(item);
};
