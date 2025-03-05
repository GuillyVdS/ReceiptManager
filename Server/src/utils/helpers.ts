export const roundAmount = (amount: number, precision: number = 2) => {
    return Math.round(amount * Math.pow(10, precision)) / Math.pow(10, precision);
};
