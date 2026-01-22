import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { updateUser, User, fetchRoles } from "../../store/slices/userSlice";
import { AppDispatch, RootState } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";

const sanitizeUrl = (url: string | undefined): string => {
    if (!url) return "";
    return url.replace(/[\n\r]/g, '').trim();
};

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
            let formDataRole = "";
            if (user.role && user.role.length > 0) {
                const firstRole = user.role[0];
                const roleId = typeof firstRole === 'object' ? (firstRole._id || "") : String(firstRole);
                const roleEntry = roles.find(r => r._id === roleId || String(r.role_id) === roleId || String(r.role_type) === roleId);
                formDataRole = roleEntry?._id || (typeof firstRole === 'object' ? firstRole._id : "");
            }

            setFormData({
                first_name: user.first_name || "",
                last_name: user.last_name || "",
                email: user.email || "",
                phone_number: user.phone_number || "",
                role: formDataRole || "",
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
            const userId = (user.id || user._id) as string;
            if (!userId) {
                throw new Error("User ID is missing");
            }

            let payload: any;

            if (image) {
                payload = new FormData();
                payload.append("first_name", formData.first_name);
                payload.append("last_name", formData.last_name);
                payload.append("email", formData.email);
                payload.append("image", image);
            } else {
                // Send as plain object if no image, simpler for most APIs
                payload = {
                    first_name: formData.first_name,
                    last_name: formData.last_name,
                    email: formData.email
                };
            }

            await dispatch(updateUser({ id: userId, data: payload })).unwrap();
            onClose();
        } catch (err: any) {
            setError(err || "Failed to update customer");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] w-full p-4 md:p-6 text-inter mx-4 md:mx-auto mt-4 md:mt-0 mb-4 md:mb-0">
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
                    <Label htmlFor="phone_number">Phone Number </Label>
                    <Input
                        id="phone_number"
                        placeholder="6392457271"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        required
                        disabled
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
                            disabled
                            className="w-full h-11 rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-gray-400 opacity-70 cursor-not-allowed"
                        >
                            <option value="">Select Role</option>
                            {roles.map((r) => (
                                <option key={r._id} value={r._id}>{r.name}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <Label htmlFor="status">Status </Label>
                        <select
                            id="status"
                            value={formData.status}
                            onChange={handleInputChange}
                            disabled
                            className="w-full h-11 rounded-lg border border-gray-300 bg-gray-50 dark:bg-gray-800/50 px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-gray-400 opacity-70 cursor-not-allowed"
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
                        {(image || user?.profile_image || (user?.image as any)?.url) && (
                            <div className="w-12 h-12 rounded-full overflow-hidden border border-gray-200">
                                <img
                                    src={image ? URL.createObjectURL(image) : sanitizeUrl(user?.profile_image || (user?.image as any)?.url)}
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
                            className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-brand-500/10 dark:file:text-brand-400"
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
