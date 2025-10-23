class GallerySlider {
    constructor() {
        this.slider = document.getElementById('gallerySlider');
        this.originalImages = [...document.querySelectorAll('.gallery-slider img')];
        this.totalImages = this.originalImages.length;
        this.modal = document.getElementById('imageModal');
        this.modalImage = document.getElementById('modalImage');
        this.modalIndex = document.getElementById('modalIndex');
        this.visibleImages = this.getVisibleImages();
        this.imageWidth = 100 / this.visibleImages;
        this.currentIndex = this.visibleImages;

        // Auto-slide properties
        this.autoSlideInterval = null;
        this.autoSlidePaused = false;
        this.autoSlideDelay = 3000; // 3 seconds between slides

        this.cloneImages();
        this.addClickListeners();
        this.updateSliderPosition(false);
        this.init();

        // START AUTO-SLIDE ON LOAD
        this.startAutoSlide();
    }

    getVisibleImages() {
        const width = window.innerWidth;
        if (width <= 480) return 1;
        if (width <= 768) return 2;
        if (width <= 1200) return 3;
        return 4;
    }

    cloneImages() {
        // Remove existing clones
        document.querySelectorAll('.gallery-slider img[data-clone]').forEach(cl => cl.remove());

        // Prepend clones of last visibleImages (in reverse order for correct sequence)
        for (let i = this.totalImages - 1; i >= this.totalImages - this.visibleImages; i--) {
            const clone = this.originalImages[i].cloneNode(true);
            clone.dataset.clone = 'true';
            this.slider.prepend(clone);
        }

        // Append clones of first visibleImages
        for (let i = 0; i < this.visibleImages; i++) {
            const clone = this.originalImages[i].cloneNode(true);
            clone.dataset.clone = 'true';
            this.slider.appendChild(clone);
        }

        // Set widths for all images (including clones)
        const allImages = document.querySelectorAll('.gallery-slider img');
        allImages.forEach(img => {
            img.style.width = `${this.imageWidth}%`;
        });
    }

    addClickListeners() {
        const allImages = document.querySelectorAll('.gallery-slider img');
        allImages.forEach(img => {
            img.addEventListener('click', () => this.openModal(parseInt(img.dataset.index)));
        });
    }

    init() {
        // Gallery arrows
        document.querySelector('.gallery-prev').addEventListener('click', () => {
            this.prevImage();
            this.pauseAutoSlide(); // PAUSE ON CLICK
        });

        document.querySelector('.gallery-next').addEventListener('click', () => {
            this.nextImage();
            this.pauseAutoSlide(); // PAUSE ON CLICK
        });

        // NEW: HOVER PAUSE/RESUME
        const galleryContainer = document.querySelector('.gallery-container');
        galleryContainer.addEventListener('mouseenter', () => this.pauseAutoSlide());
        galleryContainer.addEventListener('mouseleave', () => {
            if (!this.autoSlidePaused) this.resumeAutoSlide();
        });

        // Modal controls
        document.querySelector('.close').addEventListener('click', () => {
            this.closeModal();
            this.resumeAutoSlide(); // RESUME AFTER CLOSING MODAL
        });

        document.querySelector('.prev').addEventListener('click', () => this.prevImage());
        document.querySelector('.next').addEventListener('click', () => this.nextImage());

        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (this.modal.style.display === 'block') {
                if (e.key === 'Escape') this.closeModal();
                if (e.key === 'ArrowLeft') this.prevImage();
                if (e.key === 'ArrowRight') this.nextImage();
            }
        });

        // Click outside to close
        this.modal.addEventListener('click', (e) => {
            if (e.target === this.modal) {
                this.closeModal();
                this.resumeAutoSlide(); // RESUME AFTER CLOSING MODAL
            }
        });

        // Transition end handler
        this.slider.addEventListener('transitionend', this.handleTransitionEnd.bind(this));

        // Resize handler
        window.addEventListener('resize', this.handleResize.bind(this));
    }

    // AUTO-SLIDE METHODS
    startAutoSlide() {
        if (this.autoSlideInterval) return; // Already running

        this.autoSlideInterval = setInterval(() => {
            if (!this.autoSlidePaused) {
                this.nextImage();
            }
        }, this.autoSlideDelay);

    }

    pauseAutoSlide() {
        this.autoSlidePaused = true;
    }

    resumeAutoSlide() {
        this.autoSlidePaused = false;
    }

    // Pause on modal open, resume on close
    openModal(dataIndex) {
        let realIndex = (this.currentIndex - this.visibleImages) % this.totalImages;
        if (realIndex < 0) realIndex += this.totalImages;

        this.currentIndex = this.visibleImages + dataIndex;
        this.updateSliderPosition(true);

        this.modal.style.display = 'block';
        this.updateModal();
        document.body.style.overflow = 'hidden';

        this.pauseAutoSlide(); // PAUSE ON MODAL OPEN
    }

    closeModal() {
        this.modal.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.resumeAutoSlide(); // RESUME ON MODAL CLOSE
    }

    handleTransitionEnd() {
        if (this.currentIndex >= this.totalImages + this.visibleImages) {
            this.currentIndex = this.visibleImages;
            this.updateSliderPosition(false);
        }
        if (this.currentIndex < this.visibleImages) {
            this.currentIndex = this.totalImages + this.visibleImages - 1;
            this.updateSliderPosition(false);
        }
    }

    handleResize() {
        const oldVisible = this.visibleImages;
        const newVisible = this.getVisibleImages();
        if (oldVisible !== newVisible) {
            let realIndex = (this.currentIndex - oldVisible) % this.totalImages;
            if (realIndex < 0) realIndex += this.totalImages;

            this.visibleImages = newVisible;
            this.imageWidth = 100 / this.visibleImages;
            this.cloneImages();
            this.addClickListeners();
            this.currentIndex = this.visibleImages + realIndex;
            this.updateSliderPosition(false);
        }
    }

    updateSliderPosition(animate = true) {
        this.slider.style.transition = animate ? 'transform 0.5s ease' : 'none';
        this.slider.style.transform = `translateX(-${this.currentIndex * this.imageWidth}%)`;
        if (!animate) {
            setTimeout(() => {
                this.slider.style.transition = 'transform 0.5s ease';
            }, 0);
        }
    }

    updateModal() {
        let realIndex = (this.currentIndex - this.visibleImages) % this.totalImages;
        if (realIndex < 0) realIndex += this.totalImages;

        this.modalImage.src = this.originalImages[realIndex].src;
        this.modalImage.alt = this.originalImages[realIndex].alt;
        this.modalIndex.textContent = `${realIndex + 1} / ${this.totalImages}`;
    }

    nextImage() {
        this.currentIndex++;
        this.updateSliderPosition(true);
        this.updateModal();
    }

    prevImage() {
        this.currentIndex--;
        this.updateSliderPosition(true);
        this.updateModal();
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new GallerySlider();
});