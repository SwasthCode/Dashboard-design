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
export const ORDER_STATUS = [
    { label: "Pending", value: "pending" },
    { label: "Ready", value: "ready" },
    { label: "Shipped", value: "shipped" },
    { label: "Delivered", value: "delivered" },
    { label: "Cancelled", value: "cancelled" },
    { label: "Returned", value: "returned" },
];

export const PAYMENT_METHODS = [
    { label: "Cash on Delivery", value: "cod" },
    { label: "Online Payment", value: "online" },
];
export const STATUS = [
    { label: "Active", value: "active" },
    { label: "Inactive", value: "inactive" },
    { label: "Pending", value: "pending" },
    { label: "Available", value: "available" },
    { label: "Unavailable", value: "unavailable" },
    { label: "Out of Stock", value: "out_of_stock" },
]
// export const STATUS_COLORS = {
//     pending: "bg-orange-100 text-orange-600",
//     ready: "bg-blue-100 text-blue-600",
//     shipped: "bg-purple-100 text-purple-600",
//     delivered: "bg-green-100 text-green-600",
//     cancelled: "bg-red-100 text-red-600",
//     returned: "bg-gray-100 text-gray-600",
// };


export const DELIVERY_CHARGES = [
    { label: "Free", value: "free" },
    { label: "Paid", value: "paid" },
];

export const ADJUSTMENT_STATUSES = [
    { label: "collect", value: "collect" },
    { label: "refund", value: "refund" },
    { label: "balance", value: "balance" },
]
export const MAX_DELIVERY_CHARGES_CUT_OFF = 1000
export const DELIVERY_FEES_PER_KM = 10
export const DELIVERY_CHARGES_FEE = 99