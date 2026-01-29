import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateAddress, Address } from "../../store/slices/addressSlice";
import { AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import DotLoading from "../../components/common/DotLoading";


interface EditAddressModalProps {
    isOpen: boolean;
    onClose: () => void;
    address: Address | null;
}

export default function EditAddressModal({ isOpen, onClose, address }: EditAddressModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        shipping_phone: "",
        pincode: "",
        locality: "",
        address: "",
        city: "",
        state: "",
        landmark: "",
        alternate_phone: "",
        type: "Home",
        isDefault: false
    });

    useEffect(() => {
        if (address) {
            setFormData({
                name: address.name || "",
                shipping_phone: address.shipping_phone || "",
                pincode: address.pincode || "",
                locality: address.locality || "",
                address: address.address || "",
                city: address.city || "",
                state: address.state || "",
                landmark: address.landmark || "",
                alternate_phone: address.alternate_phone || "",
                type: address.type || "Home",
                isDefault: address.isDefault || false
            });
        }
    }, [address]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setFormData((prev) => ({
            ...prev,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!address?._id) return;

        setLoading(true);
        setError(null);

        try {
            await dispatch(updateAddress({
                id: address._id,
                data: formData
            })).unwrap();
            onClose();
        } catch (err: any) {
            setError(err || "Failed to update address");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isOpen) {
            setError(null);
        }
    }, [isOpen]);

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[700px] p-6 text-inter">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Address</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="name">Full Name</Label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <Label htmlFor="shipping_phone">Shipping Phone</Label>
                        <input
                            type="tel"
                            id="shipping_phone"
                            value={formData.shipping_phone}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="pincode">Pincode</Label>
                        <input
                            type="text"
                            id="pincode"
                            value={formData.pincode}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <Label htmlFor="locality">Locality</Label>
                        <input
                            type="text"
                            id="locality"
                            value={formData.locality}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="address">Address (Flat, House no., Building, Company, Apartment)</Label>
                    <textarea
                        id="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        required
                        className="w-full h-20 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white resize-none"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="city">City/District/Town</Label>
                        <input
                            type="text"
                            id="city"
                            value={formData.city}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        />
                    </div>

                    <div>
                        <Label htmlFor="state">State</Label>
                        <input
                            type="text"
                            id="state"
                            value={formData.state}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="landmark">Landmark (Optional)</Label>
                        <input
                            type="text"
                            id="landmark"
                            value={formData.landmark}
                            onChange={handleInputChange}
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                    <div>
                        <Label htmlFor="alternate_phone">Alternate Phone (Optional)</Label>
                        <input
                            type="tel"
                            id="alternate_phone"
                            value={formData.alternate_phone}
                            onChange={handleInputChange}
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="type">Address Type</Label>
                        <select
                            id="type"
                            value={formData.type}
                            onChange={handleInputChange}
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white dark:bg-gray-900"
                        >
                            <option value="Home">Home</option>
                            <option value="Work">Work</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="isDefault"
                        checked={formData.isDefault}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <Label htmlFor="isDefault" className="mb-0">Set as default address</Label>
                </div>

                <div className="pt-6 flex gap-4">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-200"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-3 bg-brand-500 text-white font-medium rounded-xl hover:bg-brand-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-500/20 flex items-center justify-center gap-2"
                    >
                        {loading ? (
                            <>
                                <DotLoading size="md" className="text-white" />
                                <span>Saving...</span>
                            </>
                        ) : "Update"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
