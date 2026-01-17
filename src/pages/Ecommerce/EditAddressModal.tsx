import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateAddress, Address } from "../../store/slices/addressSlice";
import { AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";

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
        phone: "",
        address_line1: "",
        address_line2: "",
        city: "",
        state: "",
        pincode: "",
        country: "India",
        is_default: false
    });

    useEffect(() => {
        if (address) {
            setFormData({
                name: address.name || "",
                phone: address.phone || "",
                address_line1: address.address_line1 || "",
                address_line2: address.address_line2 || "",
                city: address.city || "",
                state: address.state || "",
                pincode: address.pincode || "",
                country: address.country || "India",
                is_default: address.is_default || false
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

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[600px] p-6 text-inter">
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
                        <Label htmlFor="phone">Phone Number</Label>
                        <input
                            type="tel"
                            id="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="address_line1">Address Line 1</Label>
                    <input
                        type="text"
                        id="address_line1"
                        value={formData.address_line1}
                        onChange={handleInputChange}
                        required
                        className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                    />
                </div>

                <div>
                    <Label htmlFor="address_line2">Address Line 2 (Optional)</Label>
                    <input
                        type="text"
                        id="address_line2"
                        value={formData.address_line2}
                        onChange={handleInputChange}
                        className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="city">City</Label>
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
                        <Label htmlFor="country">Country</Label>
                        <input
                            type="text"
                            id="country"
                            value={formData.country}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        id="is_default"
                        checked={formData.is_default}
                        onChange={handleInputChange}
                        className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500"
                    />
                    <Label htmlFor="is_default" className="mb-0">Set as default address</Label>
                </div>

                <div className="pt-4 flex gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 px-4 py-2.5 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 px-4 py-2.5 bg-brand-500 text-white font-medium rounded-lg hover:bg-brand-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
