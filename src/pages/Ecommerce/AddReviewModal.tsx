import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createReview } from "../../store/slices/reviewSlice";
import { fetchProducts } from "../../store/slices/productSlice";
import { fetchUsers } from "../../store/slices/userSlice";
import { AppDispatch, RootState } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";

interface AddReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export default function AddReviewModal({ isOpen, onClose }: AddReviewModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const { products } = useSelector((state: RootState) => state.product);
    const { users } = useSelector((state: RootState) => state.user);
    const { user } = useSelector((state: RootState) => state.auth);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [images, setImages] = useState<File[]>([]);

    useEffect(() => {
        if (isOpen && users.length === 0) {
            dispatch(fetchUsers());
        }
    }, [dispatch, isOpen, users.length]);

    const [formData, setFormData] = useState({
        product_id: "",
        rating: 5,
        comment: "",
        status: "Published" as const,
        selectedUserId: "",
        customerName: ""
    });

    useEffect(() => {
        if (isOpen && products.length === 0) {
            dispatch(fetchProducts());
        }
    }, [dispatch, isOpen, products.length]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        if (id === 'selectedUserId') {
            const selectedCustomer = users.find(u => (u.id || u._id) === value);
            setFormData((prev) => ({
                ...prev,
                selectedUserId: value,
                customerName: selectedCustomer ? `${selectedCustomer.first_name} ${selectedCustomer.last_name}` : ""
            }));
        } else {
            setFormData((prev) => ({ ...prev, [id]: id === 'rating' ? Number(value) : value }));
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setImages(Array.from(e.target.files));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user?.id && !user?._id) {
            setError("You must be logged in to add a review");
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const { selectedUserId, customerName, ...restData } = formData;
            const targetUserId = selectedUserId || (user.id || user._id || "") as string;

            const formDataPayload = new FormData();
            formDataPayload.append("product_id", restData.product_id);
            formDataPayload.append("rating", restData.rating.toString());
            formDataPayload.append("comment", restData.comment);
            formDataPayload.append("status", restData.status);
            formDataPayload.append("user_id", targetUserId);
            formDataPayload.append("userInfo", JSON.stringify({
                fullname: customerName || `${user.first_name} ${user.last_name}`,
                _id: targetUserId
            }));

            images.forEach((img) => {
                formDataPayload.append("images", img);
            });

            await dispatch(createReview(formDataPayload)).unwrap();

            setFormData({
                product_id: "",
                rating: 5,
                comment: "",
                status: "Published",
                selectedUserId: "",
                customerName: ""
            });
            setImages([]);
            onClose();
        } catch (err: any) {
            setError(err || "Failed to add review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6 text-inter">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Add New Review</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <Label htmlFor="selectedUserId">Customer Name</Label>
                    <select
                        id="selectedUserId"
                        value={formData.selectedUserId}
                        onChange={handleInputChange}
                        required
                        className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white dark:bg-gray-900"
                    >
                        <option value="">Select Customer</option>
                        {users.map((u) => (
                            <option key={u.id || u._id} value={u.id || u._id}>
                                {u.first_name} {u.last_name}
                            </option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="product_id">Product</Label>
                    <select
                        id="product_id"
                        value={formData.product_id}
                        onChange={handleInputChange}
                        required
                        className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                    >
                        <option value="">Select Product</option>
                        {products.map((p) => (
                            <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="rating">Rating</Label>
                    <select
                        id="rating"
                        value={formData.rating}
                        onChange={handleInputChange}
                        required
                        className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                    >
                        {[5, 4, 3, 2, 1].map((n) => (
                            <option key={n} value={n}>{n} Stars</option>
                        ))}
                    </select>
                </div>

                <div>
                    <Label htmlFor="comment">Comment</Label>
                    <textarea
                        id="comment"
                        rows={3}
                        placeholder="Type your review here..."
                        className="w-full rounded-lg border border-gray-300 bg-transparent py-3 px-5 text-sm outline-none transition focus:border-brand-300 focus:ring-3 focus:ring-brand-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-brand-800"
                        value={formData.comment}
                        onChange={handleInputChange}
                        required
                    ></textarea>
                </div>

                <div>
                    <Label htmlFor="images">Review Images (Optional)</Label>
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {images.map((img, index) => (
                                <div key={index} className="w-16 h-16 rounded-lg overflow-hidden border border-gray-200 relative group">
                                    <img
                                        src={URL.createObjectURL(img)}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setImages(prev => prev.filter((_, i) => i !== index))}
                                        className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <input
                            type="file"
                            id="images"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-800 dark:file:text-brand-400"
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
                        {loading ? "Adding..." : "Add Review"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
