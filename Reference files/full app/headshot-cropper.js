// Headshot Cropper - 1:1 Face-Centered Cropping
class HeadshotCropper {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.cropOverlay = null;
    
    this.originalImage = null;
    this.imageData = null;
    this.scale = 1;
    this.offsetX = 0;
    this.offsetY = 0;
    
    this.cropBox = { x: 0, y: 0, width: 0, height: 0 };
    this.isDragging = false;
    this.isResizing = false;
    this.dragStart = { x: 0, y: 0 };
    this.resizeHandle = null;
    this.isSelecting = false;
    
    this.initializeElements();
  }

  initializeElements() {
    console.log('Initializing cropper elements...');
    
    this.canvas = document.getElementById('cropperCanvas');
    if (!this.canvas) {
      console.error('Canvas element not found!');
      return false;
    }
    console.log('Canvas element found');
    
    this.ctx = this.canvas.getContext('2d');
    if (!this.ctx) {
      console.error('Canvas context not available!');
      return false;
    }
    console.log('Canvas context created');
    
    this.cropOverlay = document.getElementById('cropOverlay');
    if (!this.cropOverlay) {
      console.error('Crop overlay element not found!');
      return false;
    }
    console.log('Crop overlay element found');
    
    this.setupEventListeners();
    console.log('Cropper elements initialized successfully');
    return true;
  }

  setupEventListeners() {
    console.log('Setting up event listeners...');
    
    // Close button
    const closeBtn = document.getElementById('cropperClose');
    const cancelBtn = document.getElementById('cropperCancel');
    const applyBtn = document.getElementById('cropperApply');
    
    if (!closeBtn || !cancelBtn || !applyBtn) {
      console.error('Missing cropper control buttons!');
      return;
    }
    
    closeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });
    cancelBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.close();
    });
    applyBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.applyCrop();
    });

    // Zoom slider removed - no longer needed

    // Prevent cropper clicks from bubbling to modal
    const cropperContainer = document.getElementById('headshotCropper');
    if (cropperContainer) {
      cropperContainer.addEventListener('click', (e) => {
        e.stopPropagation();
      });
    }

    // Canvas events
    console.log('Adding event listeners to canvas:', this.canvas);
    this.canvas.addEventListener('mousedown', (e) => {
      console.log('Canvas mousedown event fired');
      this.handleMouseDown(e);
    });
    this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    this.canvas.addEventListener('mouseup', () => {
      console.log('Canvas mouseup event fired');
      this.handleMouseUp();
    });
    // Wheel zoom removed - no longer needed

    // Add event listeners to crop handles
    this.addHandleEventListeners();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.close();
      if (e.key === 'Enter') this.applyCrop();
    });
  }
  
  addHandleEventListeners() {
    // This method will be called when the crop overlay is updated
    console.log('Handle event listeners will be added when crop overlay is created');
  }


  async loadImage(imageFile) {
    console.log('Loading image:', imageFile);
    
    // Ensure elements are initialized
    if (!this.canvas || !this.ctx) {
      console.log('Re-initializing elements...');
      const success = this.initializeElements();
      if (!success || !this.canvas || !this.ctx) {
        console.error('Failed to initialize canvas elements');
        return Promise.reject(new Error('Canvas elements not available'));
      }
    }
    
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        console.log('Image loaded successfully:', img.width, 'x', img.height);
        this.originalImage = img;
        this.setupCanvas();
        this.setDefaultCrop();
        resolve(img);
      };
      img.onerror = (error) => {
        console.error('Failed to load image:', error);
        reject(error);
      };
      img.src = URL.createObjectURL(imageFile);
    });
  }

  setupCanvas() {
    const container = document.getElementById('cropper-image-container');
    console.log('Container found:', !!container);
    if (!container) {
      console.error('Cropper container not found!');
      return;
    }
    
    const containerRect = container.getBoundingClientRect();
    console.log('Container dimensions:', containerRect.width, 'x', containerRect.height);
    
    // Fixed height for consistent cropping
    const fixedHeight = 400;
    const maxWidth = containerRect.width - 40;
    
    const img = this.originalImage;
    const aspectRatio = img.width / img.height;
    
    // Calculate scale to fit image within fixed height
    this.scale = fixedHeight / img.height;
    
    // Set canvas size with fixed height
    const canvasHeight = fixedHeight;
    const canvasWidth = img.width * this.scale;
    
    this.canvas.width = canvasWidth;
    this.canvas.height = canvasHeight;
    
    // Resize container to fit canvas exactly
    container.style.width = canvasWidth + 'px';
    container.style.height = canvasHeight + 'px';
    
    console.log('Canvas dimensions set:', canvasWidth, 'x', canvasHeight);
    console.log('Scale:', this.scale);
    
    // No offset needed since canvas fits image exactly
    this.offsetX = 0;
    this.offsetY = 0;
    
    this.updateDisplay();
  }

  updateDisplay() {
    if (!this.originalImage) {
      console.log('No original image to display');
      return;
    }
    
    console.log('Updating display...');
    
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Draw image to fill entire canvas
    const img = this.originalImage;
    const scaledWidth = img.width * this.scale;
    const scaledHeight = img.height * this.scale;
    
    console.log('Drawing image with size:', scaledWidth, scaledHeight);
    
    this.ctx.drawImage(img, 0, 0, scaledWidth, scaledHeight);
    
    // Update crop overlay
    this.updateCropOverlay();
  }

  updateCropOverlay() {
    if (!this.cropBox.width || !this.cropBox.height) {
      this.cropOverlay.style.display = 'none';
      return;
    }
    
    this.cropOverlay.style.display = 'block';
    // Position relative to canvas (which now fits image exactly)
    this.cropOverlay.style.left = this.cropBox.x + 'px';
    this.cropOverlay.style.top = this.cropBox.y + 'px';
    this.cropOverlay.style.width = this.cropBox.width + 'px';
    this.cropOverlay.style.height = this.cropBox.height + 'px';
    
    // Update handle positions and add event listeners
    this.updateHandles();
  }
  
  updateHandles() {
    const handleSize = 10;
    const handles = [
      { name: 'nw', element: this.cropOverlay.querySelector('.nw') },
      { name: 'ne', element: this.cropOverlay.querySelector('.ne') },
      { name: 'sw', element: this.cropOverlay.querySelector('.sw') },
      { name: 'se', element: this.cropOverlay.querySelector('.se') }
    ];
    
    handles.forEach(handle => {
      if (handle.element) {
        // Remove existing event listeners
        handle.element.removeEventListener('mousedown', this.handleHandleMouseDown);
        // Add new event listener
        handle.element.addEventListener('mousedown', (e) => this.handleHandleMouseDown(e, handle.name));
      }
    });
  }
  
  handleHandleMouseDown(e, handleName) {
    e.stopPropagation();
    console.log('Handle clicked:', handleName);
    
    this.isResizing = true;
    this.resizeHandle = handleName;
    this.dragStart = this.getMousePos(e);
    this.cropBoxStart = { ...this.cropBox };
  }


  setDefaultCrop() {
    // Set a default 1:1 crop in the center of the canvas (which fits image exactly)
    const size = Math.min(this.canvas.width, this.canvas.height) * 0.6;
    this.cropBox = {
      x: (this.canvas.width - size) / 2,
      y: (this.canvas.height - size) / 2,
      width: size,
      height: size
    };
    
    this.updateCropOverlay();
  }


  getMousePos(e) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  }

  handleMouseDown(e) {
    const pos = this.getMousePos(e);
    console.log('Mouse down at:', pos);
    console.log('Current crop box:', this.cropBox);
    
    // Check if clicking inside existing crop box
    if (this.cropBox.width > 0 && this.cropBox.height > 0 &&
        pos.x >= this.cropBox.x && pos.x <= this.cropBox.x + this.cropBox.width &&
        pos.y >= this.cropBox.y && pos.y <= this.cropBox.y + this.cropBox.height) {
      console.log('Dragging crop box');
      // Start dragging existing crop box
      this.isDragging = true;
      this.dragStart = pos;
      this.cropBoxStart = { ...this.cropBox };
      this.dragOffset = {
        x: pos.x - this.cropBox.x,
        y: pos.y - this.cropBox.y
      };
    } else {
      console.log('Starting new selection');
      // Start new crop selection
      this.isSelecting = true;
      this.dragStart = pos;
      
      this.cropBox = {
        x: pos.x,
        y: pos.y,
        width: 0,
        height: 0
      };
      
      this.updateCropOverlay();
    }
  }

  handleMouseMove(e) {
    const pos = this.getMousePos(e);
    
    // Only process mouse move if we're in an active interaction
    if (!this.isSelecting && !this.isDragging && !this.isResizing) {
      return;
    }
    
    console.log('Mouse move - isSelecting:', this.isSelecting, 'isDragging:', this.isDragging, 'isResizing:', this.isResizing);
    
    if (this.isSelecting) {
      // Update crop box during selection
      const deltaX = pos.x - this.dragStart.x;
      const deltaY = pos.y - this.dragStart.y;
      
      // Calculate new dimensions
      let newWidth = Math.abs(deltaX);
      let newHeight = Math.abs(deltaY);
      
      // Ensure square aspect ratio
      const size = Math.max(newWidth, newHeight);
      newWidth = size;
      newHeight = size;
      
      // Calculate new position based on drag direction
      let newX = this.dragStart.x;
      let newY = this.dragStart.y;
      
      if (deltaX < 0) newX = this.dragStart.x - newWidth;
      if (deltaY < 0) newY = this.dragStart.y - newHeight;
      
      // Constrain to canvas bounds (which fits image exactly)
      newX = Math.max(0, Math.min(this.canvas.width - newWidth, newX));
      newY = Math.max(0, Math.min(this.canvas.height - newHeight, newY));
      newWidth = Math.min(newWidth, this.canvas.width - newX);
      newHeight = Math.min(newHeight, this.canvas.height - newY);
      
      // Update crop box
      this.cropBox.x = newX;
      this.cropBox.y = newY;
      this.cropBox.width = newWidth;
      this.cropBox.height = newHeight;
      
      this.updateCropOverlay();
    } else if (this.isDragging) {
      // Move existing crop box smoothly
      const deltaX = pos.x - this.dragStart.x;
      const deltaY = pos.y - this.dragStart.y;
      
      const newX = this.cropBoxStart.x + deltaX;
      const newY = this.cropBoxStart.y + deltaY;
      
      // Constrain to canvas bounds (which fits image exactly)
      this.cropBox.x = Math.max(0, Math.min(this.canvas.width - this.cropBox.width, newX));
      this.cropBox.y = Math.max(0, Math.min(this.canvas.height - this.cropBox.height, newY));
      
      this.updateCropOverlay();
    } else if (this.isResizing) {
      this.handleResize(pos);
    }
  }

  handleMouseUp() {
    this.isDragging = false;
    this.isSelecting = false;
    this.isResizing = false;
    this.resizeHandle = null;
  }


  handleResize(pos) {
    if (!this.resizeHandle) return;
    
    const deltaX = pos.x - this.dragStart.x;
    const deltaY = pos.y - this.dragStart.y;
    
    // Calculate new size based on the largest dimension change, preserving direction
    let deltaSize;
    if (this.resizeHandle === 'nw' || this.resizeHandle === 'sw') {
      // For left handles, use -deltaX to get correct direction
      deltaSize = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        deltaSize = -deltaX; // Left handles: dragging left increases size
      } else {
        deltaSize = -deltaY; // Top handles: dragging up increases size
      }
    } else {
      // For right/bottom handles, use positive delta
      deltaSize = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      if (Math.abs(deltaX) > Math.abs(deltaY)) {
        deltaSize = deltaX; // Right handles: dragging right increases size
      } else {
        deltaSize = deltaY; // Bottom handles: dragging down increases size
      }
    }
    
    const newSize = Math.max(20, this.cropBoxStart.width + deltaSize);
    
    switch (this.resizeHandle) {
      case 'nw':
        this.cropBox.x = this.cropBoxStart.x + this.cropBoxStart.width - newSize;
        this.cropBox.y = this.cropBoxStart.y + this.cropBoxStart.height - newSize;
        this.cropBox.width = newSize;
        this.cropBox.height = newSize;
        break;
      case 'ne':
        this.cropBox.x = this.cropBoxStart.x;
        this.cropBox.y = this.cropBoxStart.y + this.cropBoxStart.height - newSize;
        this.cropBox.width = newSize;
        this.cropBox.height = newSize;
        break;
      case 'sw':
        this.cropBox.x = this.cropBoxStart.x + this.cropBoxStart.width - newSize;
        this.cropBox.y = this.cropBoxStart.y;
        this.cropBox.width = newSize;
        this.cropBox.height = newSize;
        break;
      case 'se':
        this.cropBox.x = this.cropBoxStart.x;
        this.cropBox.y = this.cropBoxStart.y;
        this.cropBox.width = newSize;
        this.cropBox.height = newSize;
        break;
    }
    
    // Constrain to canvas bounds (which fits image exactly)
    this.cropBox.x = Math.max(0, Math.min(this.canvas.width - this.cropBox.width, this.cropBox.x));
    this.cropBox.y = Math.max(0, Math.min(this.canvas.height - this.cropBox.height, this.cropBox.y));
    this.cropBox.width = Math.min(this.cropBox.width, this.canvas.width - this.cropBox.x);
    this.cropBox.height = Math.min(this.cropBox.height, this.canvas.height - this.cropBox.y);
    
    this.updateCropOverlay();
  }

  // Wheel zoom removed - no longer needed


  applyCrop() {
    if (!this.cropBox.width || !this.cropBox.height) {
      alert('Please select a crop area');
      return;
    }
    
    // Create final cropped image
    const finalCanvas = document.createElement('canvas');
    const finalCtx = finalCanvas.getContext('2d');
    
    // Set final size (512x512 for high quality)
    const finalSize = 512;
    finalCanvas.width = finalSize;
    finalCanvas.height = finalSize;
    
    // Calculate source coordinates (no offset needed since canvas fits image exactly)
    const sourceX = this.cropBox.x / this.scale;
    const sourceY = this.cropBox.y / this.scale;
    const sourceWidth = this.cropBox.width / this.scale;
    const sourceHeight = this.cropBox.height / this.scale;
    
    // Draw cropped image
    finalCtx.drawImage(
      this.originalImage,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, finalSize, finalSize
    );
    
    // Convert to data URL and call the parent function
    const imageData = finalCanvas.toDataURL('image/jpeg', 0.9);
    
    // Call the parent function to apply the cropped image
    if (typeof applyCroppedImage === 'function') {
      applyCroppedImage(imageData);
    }
    
    this.close();
  }

  close() {
    // Call the parent function to close the cropper
    if (typeof closeCropper === 'function') {
      closeCropper();
    }
  }
}

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HeadshotCropper;
}

