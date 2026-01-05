import React, { useState, useEffect } from 'react';
import { Star, MessageSquare, ThumbsUp, Trash2, User, Image as ImageIcon, X } from 'lucide-react';
import { reviewService, uploadService } from '../services/api';

const ReviewSection = ({ destinationId, destinationName, onClose }) => {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [images, setImages] = useState([]); // Array of { url, file } (file for upload, url for display)
    const [uploading, setUploading] = useState(false);
    const [contextTags, setContextTags] = useState([]); // Selected tags

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showForm, setShowForm] = useState(false);

    const AVAILABLE_TAGS = ['Family Friendly', 'Couples', 'Solo Travel', 'Budget', 'Luxury', 'Adventure', 'Relaxing', 'Nightlife'];

    const storedUser = JSON.parse(localStorage.getItem('user')) || {};
    const USER_ID = storedUser.userId;
    const USER_NAME = storedUser.name || 'Traveler';

    useEffect(() => {
        if (destinationId) {
            fetchReviews();
        }
    }, [destinationId]);

    const fetchReviews = async () => {
        setIsLoading(true);
        try {
            const res = await reviewService.getByDestination(destinationId);
            setReviews(res.data);
        } catch (error) {
            console.error("Error fetching reviews:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleImageToUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setUploading(true);
        const formData = new FormData();
        formData.append('image', file);

        try {
            const res = await uploadService.uploadImage(formData);
            if (res.data.url) {
                setImages(prev => [...prev, res.data.url]);
            }
        } catch (error) {
            console.error("Upload failed", error);
        } finally {
            setUploading(false);
        }
    };

    const toggleTag = (tag) => {
        setContextTags(prev =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) return;

        setIsSubmitting(true);
        try {
            await reviewService.add({
                destinationId,
                userId: USER_ID,
                userName: USER_NAME,
                rating,
                comment,
                images,
                tags: contextTags
            });

            setComment('');
            setRating(0);
            setImages([]);
            setContextTags([]);
            setShowForm(false);
            fetchReviews(); // Refresh list
        } catch (error) {
            console.error("Error submitting review:", error);
        } finally {
            setIsSubmitting(false);
        }
    };


    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this review?")) return;
        try {
            await reviewService.delete(id);
            setReviews(reviews.filter(r => r._id !== id));
        } catch (error) {
            console.error("Error deleting review:", error);
        }
    };

    const averageRating = reviews.length > 0
        ? (reviews.reduce((acc, curr) => acc + curr.rating, 0) / reviews.length).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-lg font-bold text-minimal-text">Reviews</h3>
                    <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center text-yellow-500">
                            <Star size={16} fill={reviews.length > 0 ? "currentColor" : "none"} className={reviews.length > 0 ? "" : "text-gray-300"} />
                            <span className="font-bold ml-1 text-sm">{averageRating || "New"}</span>
                        </div>
                        <span className="text-xs text-minimal-muted">• {reviews.length} reviews</span>
                    </div>
                </div>
                {!showForm && (
                    <button
                        onClick={() => setShowForm(true)}
                        className="btn-minimal-secondary text-xs px-3 py-2 flex items-center gap-2"
                    >
                        <Star size={14} /> Write Review
                    </button>
                )}
            </div>

            {/* Review Form */}
            {showForm && (
                <div className="p-4 bg-minimal-surface rounded-xl border border-minimal-border space-y-4 animate-in-faded">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-minimal-muted">Your Rating</label>
                        <div className="flex gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    className={`p-1 transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-500' : 'text-gray-300'}`}
                                >
                                    <Star size={24} fill={rating >= star ? "currentColor" : "none"} />
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-minimal-muted">Vibe (Optional)</label>
                        <div className="flex flex-wrap gap-2">
                            {AVAILABLE_TAGS.map(tag => (
                                <button
                                    key={tag}
                                    type="button"
                                    onClick={() => toggleTag(tag)}
                                    className={`text-[10px] px-2 py-1 rounded-full border transition-all ${contextTags.includes(tag)
                                        ? 'bg-brand-800 text-white border-brand-800'
                                        : 'bg-white text-minimal-muted border-minimal-border hover:border-brand-300'
                                        }`}
                                >
                                    {tag}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-minimal-muted">Photos</label>
                        <div className="flex items-center gap-3 overflow-x-auto pb-2">
                            {images.map((url, idx) => (
                                <div key={idx} className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border border-minimal-border group">
                                    <img src={url} alt="Uploaded" className="w-full h-full object-cover" />
                                    <button
                                        onClick={() => setImages(images.filter((_, i) => i !== idx))}
                                        className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <X size={10} />
                                    </button>
                                </div>
                            ))}
                            <label className={`w-16 h-16 rounded-lg border-2 border-dashed border-minimal-border flex flex-col items-center justify-center cursor-pointer hover:border-brand-300 transition-colors ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                                <ImageIcon size={16} className="text-minimal-muted" />
                                <span className="text-[8px] text-minimal-muted mt-1">{uploading ? '...' : 'Add'}</span>
                                <input type="file" accept="image/*" onChange={handleImageToUpload} className="hidden" />
                            </label>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-widest text-minimal-muted">Your Experience</label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            className="input-minimal w-full min-h-[80px]"
                            placeholder="Share your thoughts about this place..."
                        />
                    </div>
                    <div className="flex gap-2 justify-end">
                        <button
                            onClick={() => setShowForm(false)}
                            className="px-3 py-2 text-xs font-medium text-minimal-muted hover:text-minimal-text"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={rating === 0 || isSubmitting}
                            className="btn-minimal-primary px-4 py-2 text-xs"
                        >
                            {isSubmitting ? 'Posting...' : 'Post Review'}
                        </button>
                    </div>
                </div>
            )}

            {/* Review List */}
            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {isLoading ? (
                    <div className="text-center py-8 text-minimal-muted text-sm">Loading reviews...</div>
                ) : reviews.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-minimal-border rounded-xl">
                        <MessageSquare size={24} className="mx-auto text-minimal-muted mb-2 opacity-50" />
                        <p className="text-sm text-minimal-muted">No reviews yet. Be the first!</p>
                    </div>
                ) : (
                    reviews.map((review) => (
                        <div key={review._id} className="p-4 bg-white rounded-xl border border-minimal-border space-y-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center text-brand-800">
                                        <User size={14} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold text-minimal-text">{review.userName}</div>
                                        <div className="text-[10px] text-minimal-muted">{new Date(review.createdAt).toLocaleDateString()}</div>
                                    </div>
                                </div>
                                <div className="flex text-yellow-500">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} fill={i < review.rating ? "currentColor" : "none"} className={i < review.rating ? "" : "text-gray-200"} />
                                    ))}
                                </div>
                            </div>

                            <p className="text-sm text-minimal-text leading-relaxed pl-10">{review.comment}</p>

                            {
                                review.images && review.images.length > 0 && (
                                    <div className="pl-10 mt-2 flex gap-2 overflow-x-auto pb-1">
                                        {review.images.map((img, idx) => (
                                            <img key={idx} src={img} alt="User photo" className="h-20 w-auto rounded-lg border border-minimal-border object-cover" />
                                        ))}
                                    </div>
                                )
                            }

                            {
                                review.tags && review.tags.length > 0 && (
                                    <div className="pl-10 mt-2 flex flex-wrap gap-1">
                                        {review.tags.map(tag => (
                                            <span key={tag} className="text-[10px] bg-brand-50 text-brand-800 px-2 py-0.5 rounded-full font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                )
                            }

                            {/* Assuming current user owns their reviews for demo */}
                            {
                                review.userId === USER_ID && (
                                    <div className="flex justify-end mt-2">
                                        <button
                                            onClick={() => handleDelete(review._id)}
                                            className="text-[10px] text-red-500 hover:text-red-700 font-medium flex items-center gap-1"
                                        >
                                            <Trash2 size={10} /> Delete
                                        </button>
                                    </div>
                                )
                            }
                        </div>
                    ))
                )}
            </div>
        </div >
    );
};

export default ReviewSection;
