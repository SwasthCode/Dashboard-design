import React, { useState } from "react";
import PageBreadcrumb from "../../components/common/PageBreadCrumb";
import PageMeta from "../../components/common/PageMeta";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

export default function CreateOrder() {
    const [formData, setFormData] = useState({
        customerName: "",
        address: "",
        totalAmount: 0,
        status: "pending"
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Implement create logic here
        console.log("Create order", formData);
    };

    return (
        <div>
            <PageMeta
                title="Create Order | Khana Fast"
                description="Create a new order"
            />
            <PageBreadcrumb pageTitle="Create Order" />

            <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl p-6">
                <h2 className="text-xl font-semibold mb-6 text-gray-800 dark:text-white">New Order Details</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <Label htmlFor="customerName">Customer Name</Label>
                            <Input
                                id="customerName"
                                value={formData.customerName}
                                onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                                placeholder="Enter customer name"
                            />
                        </div>
                        <div>
                            <Label htmlFor="address">Delivery Address</Label>
                            <Input
                                id="address"
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                placeholder="Full address"
                            />
                        </div>
                    </div>

                    <div className="p-4 border border-dashed border-gray-300 rounded-lg text-center text-gray-500">
                        Product Selection Component Placeholder
                    </div>

                    <div className="flex justify-end gap-4">
                        <button type="button" className="px-6 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800">
                            Cancel
                        </button>
                        <button type="submit" className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600">
                            Create Order
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
