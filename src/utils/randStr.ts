const randStrString = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';

export const makeRandStr = (len: number): string => {
  let generated = '';
  do {
    generated += randStrString.charAt(Math.floor(Math.random() * randStrString.length));
  } while (generated.length < len);
  return generated;
};
