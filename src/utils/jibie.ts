export const checkLuhn = (value: string): boolean => {
  if (value.length < 0) return false;
  return calcLuhn(value.slice(0, -1)) === parseInt(value.slice(-1));
};

const calcLuhn = (value: string): number => {
  const digits = value.split('');
  let sum = 0;
  for (let i = 0; i < digits.length; i++) {
    const d = parseInt(digits[digits.length - 1 - i]);
    if (i % 2 == 0) {
      const v = d * 2;
      const d2 = `${v}`.split('');
      d2.forEach((d2_) => {
        sum = sum + parseInt(d2_);
      });
    } else {
      sum = sum + d;
    }
  }
  return (10 - (sum % 10)) % 10;
};
