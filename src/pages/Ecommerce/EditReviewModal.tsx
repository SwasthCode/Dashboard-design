import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { updateReview, Review } from "../../store/slices/reviewSlice";
import { AppDispatch } from "../../store";
import { Modal } from "../../components/ui/modal";
import Label from "../../components/form/Label";
import DotLoading from "../../components/common/DotLoading";


interface EditReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    review: Review | null;
}

export default function EditReviewModal({ isOpen, onClose, review }: EditReviewModalProps) {
    const dispatch = useDispatch<AppDispatch>();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [newImages, setNewImages] = useState<File[]>([]);

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
            setNewImages([]);
        }
    }, [review]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { id, value } = e.target;
        setFormData((prev) => ({ ...prev, [id]: id === 'rating' ? Number(value) : value }));
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setNewImages(Array.from(e.target.files));
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
            data.append("user_id", review.user_id);

            newImages.forEach((img) => {
                data.append("images", img);
            });

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
                    <Label htmlFor="image">Review Images (Optional)</Label>
                    <div className="space-y-4">
                        {/* Existing Images */}
                        {review?.images && review.images.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 mb-2">Existing Images:</p>
                                <div className="flex flex-wrap gap-2">
                                    {review.images.map((img, idx) => (
                                        <div key={img._id || idx} className="h-14 w-14 rounded-lg overflow-hidden border border-gray-100 dark:border-gray-800">
                                            <img
                                                src={img.url.replace(/[\n\r]+/g, '').trim()}
                                                alt={`Review ${idx + 1}`}
                                                className="w-full h-full object-cover"
                                            />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* New Previews */}
                        {newImages.length > 0 && (
                            <div>
                                <p className="text-xs text-gray-500 mb-2">New Images:</p>
                                <div className="flex flex-wrap gap-2">
                                    {newImages.map((img, index) => (
                                        <div key={index} className="w-14 h-14 rounded-lg overflow-hidden border border-gray-200 relative group">
                                            <img
                                                src={URL.createObjectURL(img)}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setNewImages(prev => prev.filter((_, i) => i !== index))}
                                                className="absolute top-0 right-0 bg-red-500 text-white p-0.5 rounded-bl-lg opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                </svg>
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <input
                            type="file"
                            id="image"
                            accept="image/*"
                            multiple
                            onChange={handleImageChange}
                            className="w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100 dark:file:bg-gray-800 dark:file:text-brand-400"
                        />
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
                                <span>Saving...</span>
                            </>
                        ) : "Save Changes"}
                    </button>
                </div>
            </form>
        </Modal>
    );
}
