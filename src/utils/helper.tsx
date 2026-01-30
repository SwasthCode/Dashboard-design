export const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
        case "pending": return "bg-orange-100 text-orange-600";
        case "ready": return "bg-blue-100 text-blue-600";
        case "shipped": return "bg-purple-100 text-purple-600";
        case "delivered": return "bg-green-100 text-green-600";
        case "cancelled": return "bg-red-100 text-red-600";
        case "returned": return "bg-gray-100 text-gray-600";
        case "hold": return "bg-gray-100 text-gray-600";
        default: return "bg-gray-100 text-gray-600";
    }
};