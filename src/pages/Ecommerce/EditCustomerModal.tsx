import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, User, fetchRoles } from "../../store/slices/userSlice";
import { AppDispatch, RootState } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

interface EditCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

export default function EditCustomerModal({ isOpen, onClose, user }: EditCustomerModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { roles } = useSelector((state: RootState) => state.user);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        phone_number: "",
        role: "",
        status: "active"
    });

    useEffect(() => {
        if (isOpen && roles.length === 0) {
            dispatch(fetchRoles());
        }
    }, [dispatch, isOpen, roles.length]);

    useEffect(() => {
        if (user) {
            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                phone_number: user.phone_number || "",
                role: user.role?.[0]?._id || "",
                status: user.status || "active"
            });
            setImage(null);
        }
    }, [user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id && !user?._id) return;

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append("first_name", formData.first_name);
            data.append("last_name", formData.last_name);
            data.append("email", formData.email);
            data.append("phone_number", formData.phone_number);
            data.append("status", formData.status.toLowerCase());

            // Send role object as string or as separate fields depending on API
            const selectedRole = roles.find(r => r._id === formData.role);
            if (selectedRole) {
                data.append("role", JSON.stringify([selectedRole]));
            }

            if (image) {
                data.append("image", image);
            }

            await dispatch(updateUser(data)).unwrap();
            onClose();
        } catch (err: any) {
            setError(err || "Failed to update customer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6 text-inter">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Customer</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="first_name">First Name</Label>
                        <Input
                            id="first_name"
                            placeholder="John"
                            value={formData.first_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div>
                        <Label htmlFor="last_name">Last Name</Label>
                        <Input
                            id="last_name"
                            placeholder="Doe"
                            value={formData.last_name}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                </div>

                <div>
                    <Label htmlFor="email">Email</Label>
                    <Input
                        id="email"
                        type="email"
                        placeholder="john@example.com"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div>
                    <Label htmlFor="phone_number">Phone Number</Label>
                    <Input
                        id="phone_number"
                        placeholder="6392457271"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <Label htmlFor="role">Role</Label>
                        <select
                            id="role"
                            value={formData.role}
                            onChange={handleInputChange}
                            required
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        >
                            <option value="">Select Role</option>
                            {roles.map((r) => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="status">Status</Label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                        >
                            <option value="active">Active</option>
                            <option value="pending">Pending</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                </div>

                <div>
                    <Label htmlFor="image">Profile Image</Label>
                    <div className="flex items-center gap-4">
                        {(image || (user?.image as any)?.url) && (
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                                <img
                                    src={image ? URL.createObjectURL(image) : (user?.image as any)?.url}
                                    alt="Profile"
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}
                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            onChange={handleImageChange}
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                        />
                    </div>
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
