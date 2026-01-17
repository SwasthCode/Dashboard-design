import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateReview, Review } from "../../store/slices/reviewSlice";
import { AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";

interface EditReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    review: Review | null;
}

export default function EditReviewModal({ isOpen, onClose, review }: EditReviewModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [image, setImage] = useState<File | null>(null);

    const [formData, setFormData] = useState({
        rating: 5,
        comment: "",
        status: "Published" as "Published" | "Pending"
    });

    useEffect(() => {
        if (review) {
            setFormData({
                rating: review.rating || 5,
                comment: review.comment || "",
                status: review.status || "Published"
            });
            setImage(null);
        }
    }, [review]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: id === 'rating' ? Number(value) : value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImage(e.target.files[0]);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!review?._id) return;

        setLoading(true);
        setError(null);

        try {
            const data = new FormData();
            data.append("rating", formData.rating.toString());
            data.append("comment", formData.comment);
            data.append("status", formData.status);

            if (image) {
                data.append("image", image);
            }

            await dispatch(updateReview({
                id: review._id,
                data: data
            })).unwrap();
            onClose();
        } catch (err: any) {
            setError(err || "Failed to update review");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} className="max-w-[500px] p-6 text-inter">
            <div className="border-b border-gray-100 dark:border-gray-800 pb-4 mb-6">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Edit Review</h3>
            </div>

            {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-500 text-sm rounded-lg border border-red-100">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label htmlFor="status">Status</Label>
                    <select
                        id="status"
                        value={formData.status}
                        onChange={handleInputChange}
                        required
                        className="w-full h-11 rounded-lg border border-gray-300 bg-transparent px-4 py-2.5 text-sm focus:border-brand-300 focus:ring-brand-500/20 dark:border-gray-700 dark:text-white"
                    >
                        <option value="Published">Published</option>
                        <option value="Pending">Pending</option>
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
                    <Label htmlFor="image">Review Image (Optional)</Label>
                    <div className="flex items-center gap-4">
                        {(image || (review?.image as any)?.url) && (
                            <div className="w-12 h-12 rounded-lg overflow-hidden border border-gray-200">
                                <img
                                    src={image ? URL.createObjectURL(image) : (review?.image as any)?.url}
                                    alt="Preview"
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
