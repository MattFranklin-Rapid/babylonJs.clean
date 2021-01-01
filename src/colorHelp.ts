/**
 * Byte to Decimal
 * @param number : Number 0 to 255
 */
export function btd (number) {
    return number/255;
}

/**
 * Decimal to Byte
 * @param number : Decimal 0 to 1
 */
export function dtt (number) {
    return 255 * number;
}