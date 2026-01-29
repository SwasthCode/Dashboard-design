import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createUser, User, fetchRoles, fetchUsers } from "../../store/slices/userSlice";
import { AppDispatch, RootState } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import Input from "../../components/form/input/InputField";
import DotLoading from "../../components/common/DotLoading";


interface AddCustomerModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialRoleId?: string;
}

export default function AddCustomerModal({ isOpen, onClose, initialRoleId }: AddCustomerModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { roles } = useSelector((state: RootState) => state.user);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
        if (isOpen && initialRoleId) {
            setFormData(prev => ({ ...prev, role: initialRoleId }));
        }
        if (!isOpen) {
            setFormData({
                first_name: "",
                last_name: "",
                email: "",
                phone_number: "",
                role: "",
                status: "active"
            });
            setError(null);
            setLoading(false);
        }
    }, [dispatch, isOpen, roles.length, initialRoleId]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            const selectedRole = roles.find((r: any) => r._id === formData.role);
            const userData: User = {
                ...formData,
                status: formData.status.toLowerCase(),
                role: selectedRole ? [selectedRole?.role_type] : []
            };
            await dispatch(createUser(userData)).unwrap();

            const filter: any = {};
            if (initialRoleId) {
                const role = roles.find(r => r._id === initialRoleId);
                if (role && role.role_id !== undefined) {
                    filter['role.role_id'] = role.role_id;
                }
            }
            dispatch(fetchUsers({ filter, limit: 1000 }));
            // Reset and close
            onClose();
        } catch (err: any) {
            setError(err || "Failed to add user");
        } finally {
            setLoading(false);
        }
    };

    const selectedRoleName = roles.find(r => r._id === formData.role)?.name;
    const modalTitle = selectedRoleName ? `Add New ${selectedRoleName}` : "Add New User";

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] w-full p-4 md:p-6 text-inter mx-4 md:mx-auto mt-4 md:mt-0 mb-4 md:mb-0">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">{modalTitle}</h3>
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
                        placeholder="9876543210"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        max={10}
                        maxLength={10}
                        required
                    />
                </div>

                <div className={`grid ${initialRoleId ? "grid-cols-1" : "grid-cols-2"} gap-4`}>
                    {!initialRoleId && (
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
                    )}
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
                                <span>Adding...</span>
                            </>
                        ) : modalTitle}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
