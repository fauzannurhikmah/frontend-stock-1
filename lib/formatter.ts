export const formatAbbreviated = (value: string) => {
    if (!value || parseFloat(value) === 0) return '-';
    const num = Math.abs(parseFloat(value));

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

    return `${rounded.toLocaleString('en-US')}${unit}`;
};