// Simulates a network delay
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

/**
 * MOCK: Fetches pending reviews for a specific doctor.
 * @param {string} doctorId - The ID of the doctor (not used in this mock, but present for API consistency)
 * @returns {Promise<Array>} A promise that resolves to the list of pending reviews.
 */
export const getPendingReviews = async (doctorId) => {
  console.log(`MOCK: Fetching reviews for doctor: ${doctorId}`);
  await delay(500); // Simulate network latency
  // In a real app, you'd filter reviews by doctorId here
  return Promise.resolve(allPendingReviews);
};

/**
 * MOCK: Updates the status of a review.
 * @param {string} reviewId - The ID of the review to update.
 * @param {string} action - The action taken (e.g., 'approved', 'needs_followup').
 * @param {string} notes - The notes from the doctor.
 * @returns {Promise<Object>} A promise that resolves with a success message.
 */
export const updateReviewStatus = async (reviewId, action, notes) => {
  console.log(`MOCK: Updating review ${reviewId} with action: ${action}`);
  console.log(`MOCK: Doctor Notes: ${notes}`);
  await delay(300); 
  
  return Promise.resolve({ success: true, reviewId, newStatus: action });
};