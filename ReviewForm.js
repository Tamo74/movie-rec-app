export function createReviewForm(movieId, existingReview = null) {
    const form = document.createElement('div');
    form.className = 'review-form';
    
    form.innerHTML = `
        <h4>Write a Review</h4>
        <div class="star-rating">
            ${[1,2,3,4,5].map(star => `
                <span class="star" data-rating="${star}">☆</span>
            `).join('')}
        </div>
        <textarea placeholder="What did you think?" maxlength="500"></textarea>
        <div class="char-count">0/500</div>
        <button class="submit-btn">Submit Review</button>
    `;
    
    // Add character counter
    const textarea = form.querySelector('textarea');
    const charCount = form.querySelector('.char-count');
    textarea.addEventListener('input', () => {
        charCount.textContent = `${textarea.value.length}/500`;
    });
    
    return form;
}

