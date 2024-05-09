export const display = (number: number, places: number = 3): string => {
    let string = number.toFixed(places);

    while (true) {
        if (string.endsWith("0")) {
            string = string.substring(0, string.length - 1);
        } else if (string.endsWith(".")) {
            string = string.substring(0, string.length - 1);
            return string;
        } else {
            break;
        }
    }
    return string;
};
