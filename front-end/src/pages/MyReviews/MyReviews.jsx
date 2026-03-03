import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUserReviews, updateReview, deleteReview } from '../../features/review/reviewSlice';
import { Link } from 'react-router-dom';
import { FaSpinner, FaStar, FaRegStar, FaEdit, FaTrash, FaCheck, FaTimes } from 'react-icons/fa';
import Pagination from '../../components/common/Pagination';
import { format } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';

const MyReviews = () => {
  const dispatch = useDispatch();
  const { userReviews, userPagination, loading, success } = useSelector((state) => state.review);
  const [currentPage, setCurrentPage] = useState(1);
  const [editMode, setEditMode] = useState(false);
  const [editReviewData, setEditReviewData] = useState({
    id: null,
    rating: 5,
    comment: '',
  });

  useEffect(() => {
    dispatch(fetchUserReviews({ page: currentPage }));
  }, [dispatch, currentPage, success]);

  const handlePageChange = (page) => setCurrentPage(page);

  const formatDate = (dateString) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy, HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const renderStars = (rating) => (
    <div className="flex text-soft-gold">
      {[...Array(5)].map((_, i) => (
        <span key={i}>{i < rating ? <FaStar /> : <FaRegStar />}</span>
      ))}
    </div>
  );

  const handleEdit = (review) => {
    setEditMode(true);
    setEditReviewData({ id: review._id, rating: review.rating || 5, comment: review.comment || '' });
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      dispatch(deleteReview(id));
    }
  };

  const handleEditCancel = () => {
    setEditMode(false);
    setEditReviewData({ id: null, rating: 5, comment: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditReviewData((prev) => ({ ...prev, [name]: value }));
  };

  const handleRatingChange = (rating) => {
    setEditReviewData((prev) => ({ ...prev, rating }));
  };

  const handleEditSubmit = (e) => {
    e.preventDefault();
    dispatch(updateReview({ id: editReviewData.id, reviewData: { rating: editReviewData.rating, comment: editReviewData.comment } }))
      .then(() => {
        setEditMode(false);
      });
  };

  return (
    <div className="bg-cream min-h-screen font-bodyFont">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold font-titleFont mb-8 text-charcoal">My Reviews</h1>

        {loading && !userReviews.length ? (
          <div className="flex justify-center items-center py-16">
            <FaSpinner className="animate-spin text-3xl text-forest-green" />
          </div>
        ) : userReviews.length > 0 ? (
          <div>
            <AnimatePresence>
              {userReviews.map((review) => (
                <motion.div
                  key={review._id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0, margin: 0, padding: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white rounded-lg shadow-md p-6 mb-4 border border-black/10"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center">
                      {review.productId?.image && (
                        <div className="mr-4 flex-shrink-0">
                          <img src={review.productId.image} alt={review.productId.title} className="w-20 h-20 object-cover rounded-md" />
                        </div>
                      )}
                      <div>
                        <h2 className="font-bold font-titleFont text-xl mb-1">
                          {review.productId ? (
                            <Link to={`/product/${review.productId._id}`} className="text-forest-green hover:underline">
                              {review.productId.title}
                            </Link>
                          ) : (
                            <span className="text-charcoal/70">Product not available</span>
                          )}
                        </h2>
                        {review.rating && renderStars(review.rating)}
                        <div className="text-charcoal/60 text-sm mt-1">Posted on {formatDate(review.createdAt)}</div>
                      </div>
                    </div>
                    <div className="flex space-x-3">
                      <button onClick={() => handleEdit(review)} className="text-charcoal/60 hover:text-forest-green transition-colors" title="Edit review"><FaEdit /></button>
                      <button onClick={() => handleDelete(review._id)} className="text-charcoal/60 hover:text-soft-gold transition-colors" title="Delete review"><FaTrash /></button>
                    </div>
                  </div>
                  <div className="mt-4"><p className="text-charcoal/90">{review.comment}</p></div>
                  {review.parentId && (
                    <div className="mt-4 ml-8 p-4 bg-cream/60 rounded-md border-l-4 border-forest-green/20">
                      <p className="text-sm text-charcoal/60 italic">In reply to a review by {review.parentId.userId?.username || 'user'}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            {userPagination?.pages > 1 && <div className="mt-6"><Pagination currentPage={currentPage} totalPages={userPagination.pages} onPageChange={handlePageChange} /></div>}
          </div>
        ) : (
          <div className="bg-white/50 border border-dashed border-black/10 rounded-md p-8 text-center">
            <p className="text-charcoal/80 mb-4">You haven't written any reviews yet.</p>
            <Link to="/" className="bg-forest-green text-cream px-4 py-2 rounded-lg hover:bg-forest-green/90 transition-colors inline-block">Browse Products</Link>
          </div>
        )}

        <AnimatePresence>
          {editMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-gray-600 bg-opacity-50 h-full w-full z-50 flex items-center justify-center"
            >
              <motion.div
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -50, opacity: 0 }}
                className="relative mx-auto p-6 bg-white w-full max-w-md rounded-lg shadow-lg font-bodyFont"
              >
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold font-titleFont text-charcoal">Edit Review</h3>
                  <button onClick={handleEditCancel} className="text-charcoal/50 hover:text-charcoal transition-colors"><FaTimes size={20} /></button>
                </div>
                <form onSubmit={handleEditSubmit}>
                  <div className="mb-4">
                    <label className="block text-charcoal/90 text-sm font-bold mb-2">Rating</label>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <button key={i} type="button" onClick={() => handleRatingChange(i + 1)} className="text-2xl text-soft-gold focus:outline-none transition-transform hover:scale-110">
                          {i < editReviewData.rating ? <FaStar /> : <FaRegStar />}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label htmlFor="comment" className="block text-charcoal/90 text-sm font-bold mb-2">Comment</label>
                    <textarea id="comment" name="comment" value={editReviewData.comment} onChange={handleEditChange} required rows="4" className="w-full px-3 py-2 border border-black/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-forest-green/50 bg-white" placeholder="Write your review here..."></textarea>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button type="button" onClick={handleEditCancel} className="px-4 py-2 text-charcoal/80 bg-black/10 rounded-lg hover:bg-black/20 transition-colors">Cancel</button>
                    <button type="submit" className="px-4 py-2 bg-forest-green text-cream rounded-lg hover:bg-forest-green/90 flex items-center gap-2 transition-colors" disabled={loading}>
                      {loading ? <><FaSpinner className="animate-spin" />Updating...</> : <><FaCheck />Update Review</>}
                    </button>
                  </div>
                </form>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default MyReviews;
 