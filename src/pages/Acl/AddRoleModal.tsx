import { useState } from "react";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { createRole } from "../../store/slices/roleSlice";
import Input from "../../components/form/input/InputField";
import Label from "../../components/form/Label";
import { Modal } from "../../components/ui/modal";

interface AddRoleModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddRoleModal({ isOpen, onClose }: AddRoleModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        key: "",
        status: "active",
        is_active: true
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        if (id === "name") {
            setFormData(prev => ({
                ...prev,
                name: value,
                key: value.toLowerCase().replace(/\s+/g, '-')
            }));
        } else {
            setFormData(prev => ({ ...prev, [id]: value }));
        }
    };

    const handleStatusToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
        const checked = e.target.checked;
        setFormData(prev => ({
            ...prev,
            is_active: checked,
            status: checked ? "active" : "inactive"
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (!formData.name.trim()) {
            setError("Role name is required");
            return;
        }

        setLoading(true);
        try {
            const { key, status, is_active, ...payload } = formData;
            await dispatch(createRole(payload)).unwrap();
            setFormData({ name: "", key: "", status: "active", is_active: true });
            onClose();
        } catch (err: any) {
            setError(err || "Failed to create role");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-lg w-full p-0 overflow-hidden text-outfit">
            <div className="bg-white dark:bg-gray-900">
                {/* Header */}
                <div className="p-6 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-gray-800 dark:text-white">Create New Role</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Define permissions and access levels.</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-sm rounded-xl border border-red-100 dark:border-red-500/20 flex items-center gap-3">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                            </svg>
                            {error}
                        </div>
                    )}

                    <div className="bg-gray-50/50 dark:bg-gray-800/20 p-5 rounded-2xl border border-gray-100 dark:border-gray-800 space-y-5">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* <div className="md:col-span-2">
                                <Label htmlFor="name" className="text-xs uppercase font-bold tracking-wider text-gray-400">Role Name</Label>
                                <Input
                                    id="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    placeholder="e.g. System Administrator"
                                    className="h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                                    required
                                />
                            </div> */}
                            <div>
                                <Label htmlFor="key" className="text-xs uppercase font-bold tracking-wider text-gray-400">Role Key (Auto)</Label>
                                <Input
                                    id="key"
                                    value={formData.key}
                                    onChange={handleInputChange}
                                    placeholder="e.g. system-admin"
                                    className="h-11 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-800"
                                    readOnly
                                />
                            </div>
                            <div className="flex flex-col justify-end">
                                <div className="flex items-center gap-3 p-3 bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 h-11">
                                    <input
                                        type="checkbox"
                                        id="is_active"
                                        checked={formData.is_active}
                                        onChange={handleStatusToggle}
                                        className="h-5 w-5 rounded border-gray-300 text-brand-500 focus:ring-brand-500"
                                    />
                                    <Label htmlFor="is_active" className="mb-0 text-sm font-semibold text-gray-700 dark:text-gray-300">Active Status</Label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-bold text-sm rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                            disabled={loading}
                        >
                            Discard
                        </button>
                        <button
                            type="submit"
                            className="flex-[2] px-6 py-3 bg-brand-500 text-white font-bold text-sm rounded-xl hover:bg-brand-600 transition-all shadow-lg shadow-brand-500/20 active:scale-[0.98] disabled:opacity-50"
                            disabled={loading}
                        >
                            {loading ? "Processing..." : "Create Role"}
                        </button>
                    </div>
                </form>
            </div>
        </Modal>
    );
}
