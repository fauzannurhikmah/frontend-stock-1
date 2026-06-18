export const formatAbbreviated = (value: string) => {
    if (!value || parseFloat(value) === 0) return '-';

    const parsed = parseFloat(value);
    const isNegative = parsed < 0;
    const num = Math.abs(parsed);

    let val = 0;
    let unit = "";

    if (num >= 1e9) {
        val = num / 1e9;
        unit = " B";
    } else if (num >= 1e6) {
        val = num / 1e6;
        unit = " M";
    } else {
        val = num;
    }

    const rounded = Math.round(val);
    const formattedNumber = `${rounded.toLocaleString('id-ID')}${unit}`;

    return isNegative ? `(${formattedNumber})` : formattedNumber;
};