export const ITEMS_PER_PAGE = 10;
export const MIN_TABLE_HEIGHT = "min-h-[600px]"; //  <div className={`overflow-x-auto ${MIN_TABLE_HEIGHT}`}>
export const PRODUCT_UNITS = [
    { label: "Kg", value: "kg" },
    { label: "Gram", value: "gm" },
    { label: "Milligram", value: "mg" },

    { label: "Litre", value: "ltr" },
    { label: "Millilitre", value: "ml" },

    { label: "Piece", value: "piece" },
    { label: "Pcs", value: "pcs" },

    { label: "Box", value: "box" },
    { label: "Carton", value: "carton" },
    { label: "Packet", value: "packet" },
    { label: "Bag", value: "bag" },

    { label: "Dozen", value: "dozen" },
    { label: "Pair", value: "pair" },
    { label: "Set", value: "set" },

    { label: "Meter", value: "meter" },
    { label: "Centimeter", value: "cm" },
    { label: "Foot", value: "ft" },
    { label: "Inch", value: "inch" },

    { label: "Roll", value: "roll" },
    { label: "Bundle", value: "bundle" },
    { label: "Tray", value: "tray" },
    { label: "Bottle", value: "bottle" },
    { label: "Can", value: "can" },
    { label: "Tin", value: "tin" }
];

export const PRODUCT_PRICE_RANGES = [
    { label: "Under 500", value: "0-500" },
    { label: "500 - 1000", value: "500-1000" },
    { label: "1000 - 5000", value: "1000-5000" },
    { label: "Above 5000", value: "5000-" },
    { label: "Custom Range", value: "custom" },
];
