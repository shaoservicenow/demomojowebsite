/**
 * PowerPoint Export Module for DemoMojo
 * Exports stories with personas, chapters, value drivers, and screenshots to PPT
 */

class PPTExporter {
  constructor() {
    this.pptx = null;
    this.colors = {
      primary: '032D42',
      secondary: '7661FF',
      accent: '63DF4E',
      background: 'FFFFFF',
      text: '1E293B',
      textLight: '64748B'
    };
  }

  /**
   * Initialize PptxGenJS library with optional color scheme
   */
  async init(colorScheme = null) {
    // Check if library is available
    if (typeof PptxGenJS === 'undefined') {
      throw new Error('PptxGenJS library not loaded. Please reload the setup page.');
    }
    
    // Apply custom color scheme if provided
    if (colorScheme) {
      this.applyColorScheme(colorScheme);
    }
    
    this.pptx = new PptxGenJS();
    
    // Set presentation properties
    this.pptx.author = 'DemoMojo';
    this.pptx.company = 'DemoMojo';
    this.pptx.title = 'Demo Story Presentation';
    this.pptx.subject = 'Demo Narrative';
  }

  /**
   * Apply custom color scheme
   */
  applyColorScheme(scheme) {
    if (scheme.primary) {
      this.colors.primary = this.rgbaToHex(scheme.primary);
    }
    if (scheme.secondary) {
      this.colors.secondary = this.rgbaToHex(scheme.secondary);
    }
    if (scheme.accent) {
      this.colors.accent = this.rgbaToHex(scheme.accent);
    }
    if (scheme.background) {
      this.colors.background = this.rgbaToHex(scheme.background);
    }
    if (scheme.text) {
      this.colors.text = this.rgbaToHex(scheme.text);
    }
    if (scheme.textLight) {
      this.colors.textLight = this.rgbaToHex(scheme.textLight);
    }
  }

  /**
   * Convert RGBA to HEX for PPT
   */
  rgbaToHex(rgba) {
    // Extract RGB values from rgba string
    const match = rgba.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
    if (match) {
      const r = parseInt(match[1]).toString(16).padStart(2, '0');
      const g = parseInt(match[2]).toString(16).padStart(2, '0');
      const b = parseInt(match[3]).toString(16).padStart(2, '0');
      return (r + g + b).toUpperCase();
    }
    // If it's already hex, clean it
    if (rgba.startsWith('#')) {
      return rgba.substring(1).toUpperCase();
    }
    return rgba;
  }

  /**
   * Export a story to PowerPoint
   * @param {Object} story - The story object to export
   */
  async exportStory(story) {
    // Add title slide
    this.addTitleSlide(story.name);
    
    // Add overview slide
    this.addOverviewSlide(story);
    
    // Add slides for each persona and their chapters
    for (let personaIndex = 0; personaIndex < story.personas.length; personaIndex++) {
      const persona = story.personas[personaIndex];
      
      // Add persona introduction slide
      this.addPersonaSlide(persona, personaIndex + 1);
      
      // Add slides for each chapter (needs to be async for image dimensions)
      for (let chapterIndex = 0; chapterIndex < persona.chapters.length; chapterIndex++) {
        const chapter = persona.chapters[chapterIndex];
        await this.addChapterSlide(persona, chapter, chapterIndex + 1);
      }
    }
    
    // Add final slide
    
    // Generate and download the file
    const fileName = `${this.sanitizeFileName(story.name)}_Story.pptx`;
    await this.pptx.writeFile({ fileName });
    
    console.log('PowerPoint exported:', fileName);
  }

  /**
   * Add title slide
   */
  addTitleSlide(storyName) {
    const slide = this.pptx.addSlide();
    slide.background = { color: this.colors.primary };
    
    // Add title
    slide.addText(storyName, {
      x: 0.5,
      y: 1.85,
      w: 9,
      h: 1.0,
      fontSize: 44,
      bold: true,
      color: 'FFFFFF',
      align: 'center',
      valign: 'middle'
    });
    
    // Add subtitle
    slide.addText('Created with DemoMojo', {
      x: 0.5,
      y: 3.05,
      w: 9,
      h: 0.4,
      fontSize: 20,
      color: this.colors.accent,
      align: 'center',
      valign: 'middle'
    });
  }

  /**
   * Add overview slide with all personas
   */
  addOverviewSlide(story) {
    const slide = this.pptx.addSlide();
    slide.background = { color: 'F8FAFC' };
    
    // Add title
    slide.addText('Story Overview', {
      x: 0.5,
      y: 0.5,
      w: 9,
      h: 0.5,
      fontSize: 32,
      bold: true,
      color: this.colors.primary,
      align: 'left'
    });
    
    // Add personas list with chapters as sub-points
    slide.addText('Personas & Chapters:', {
      x: 0.5,
      y: 1.2,
      w: 9,
      h: 0.4,
      fontSize: 18,
      bold: true,
      color: this.colors.primary,
      align: 'left'
    });
    
    let currentY = 1.7;
    const lineHeight = 0.25;
    
    story.personas.forEach((p, i) => {
      // Add persona
      slide.addText(`${p.name}${p.businessTitle ? ' - ' + p.businessTitle : ''}`, {
        x: 0.8,
        y: currentY,
        w: 8.5,
        h: lineHeight,
        fontSize: 16,
        bold: true,
        color: this.colors.text,
        align: 'left',
        bullet: true
      });
      currentY += lineHeight;
      
      // Add chapters as sub-points
      p.chapters.forEach((c, j) => {
        slide.addText(c.title, {
          x: 1.2,
          y: currentY,
          w: 8.1,
          h: lineHeight,
          fontSize: 14,
          color: this.colors.text,
          align: 'left',
          bullet: true
        });
        currentY += lineHeight;
      });
      
      // Add spacing between personas
      currentY += 0.1;
    });
    
    
  }

  /**
   * Add persona introduction slide
   */
  addPersonaSlide(persona, personaNumber) {
    const slide = this.pptx.addSlide();
    slide.background = { color: this.colors.secondary };
    
    // Add headshot if available (centered at top)
    if (persona.headshot && persona.headshot.startsWith('data:image')) {
      slide.addImage({
        data: persona.headshot,
        x: 4.0,
        y: 1.2,
        w: 2.0,
        h: 2.0,
        sizing: { type: 'contain', w: 2.0, h: 2.0 },
        rounding: true
      });
    }
    
    // Add persona name (centered below image)
    slide.addText(persona.name, {
      x: 0.5,
      y: 3.4,
      w: 9,
      h: 0.6,
      fontSize: 36,
      bold: true,
      color: 'FFFFFF',
      align: 'center'
    });
    
    if (persona.businessTitle) {
      slide.addText(persona.businessTitle, {
        x: 0.5,
        y: 4.1,
        w: 9,
        h: 0.4,
        fontSize: 20,
        color: this.colors.accent,
        align: 'center',
        italic: true
      });
    }
    
  }

  /**
   * Add chapter slide with value drivers and screenshot
   */
  async addChapterSlide(persona, chapter, chapterNumber) {
    const slide = this.pptx.addSlide();
    slide.background = { color: this.colors.background };
    
    // Add persona header with avatar, name, and title
    // Add persona avatar (small)
    if (persona.headshot && persona.headshot.startsWith('data:image')) {
      slide.addImage({
        data: persona.headshot,
        x: 0.5,
        y: 0.3,
        w: 0.3,
        h: 0.3,
        sizing: { type: 'contain', w: 0.3, h: 0.3 },
        rounding: true
      });
    }
    
    // Add persona name and title
    const personaTitle = persona.businessTitle ? `${persona.name} - ${persona.businessTitle}` : persona.name;
    slide.addText(personaTitle, {
      x: 0.9,
      y: 0.35,
      w: 8.5,
      h: 0.2,
      fontSize: 12,
      color: this.colors.secondary,
      bold: true
    });
    
    // Add chapter title
    slide.addText(`Chapter ${chapterNumber}: ${chapter.title}`, {
      x: 0.5,
      y: 0.7,
      w: 9,
      h: 0.5,
      fontSize: 24,
      bold: true,
      color: this.colors.primary
    });
    
    // Determine layout based on whether screenshot exists
    if (chapter.screenshot && chapter.screenshot.startsWith('data:image')) {
      // Two-column layout: Value Drivers on left, Screenshot on right
      
      // Value Drivers section (left side)
      slide.addText('Value Drivers:', {
        x: 0.5,
        y: 1.4,
        w: 4.5,
        h: 0.3,
        fontSize: 16,
        bold: true,
        color: this.colors.primary
      });
      
      // Add value drivers as bullet points
      if (chapter.valueDrivers && chapter.valueDrivers.length > 0) {
        const driversText = chapter.valueDrivers.map(d => ({
          text: d,
          options: { bullet: true, color: this.colors.text, fontSize: 13 }
        }));
        
        slide.addText(driversText, {
          x: 0.7,
          y: 1.8,
          w: 4.2,
          h: 5.5,
          fontSize: 13,
          color: this.colors.text,
          valign: 'top',
          lineSpacing: 22,
          wrap: true
        });
      }
      
      // Screenshot (right side) - get actual dimensions
      const imgDimensions = await this.getImageDimensions(chapter.screenshot);
      const maxWidth = 4.3;
      const maxHeight = 5.8;
      
      // Calculate dimensions maintaining aspect ratio
      let imgWidth = imgDimensions.width / 96; // Convert pixels to inches (96 DPI)
      let imgHeight = imgDimensions.height / 96;
      
      // Scale down if too large
      if (imgWidth > maxWidth || imgHeight > maxHeight) {
        const scale = Math.min(maxWidth / imgWidth, maxHeight / imgHeight);
        imgWidth = imgWidth * scale;
        imgHeight = imgHeight * scale;
      }
      
      slide.addImage({
        data: chapter.screenshot,
        x: 5.2,
        y: 1.4,
        w: imgWidth,
        h: imgHeight
      });
      
    } else {
      // Full-width layout: No screenshot, just value drivers
      
      slide.addText('Value Drivers:', {
        x: 0.5,
        y: 1.4,
        w: 9,
        h: 0.3,
        fontSize: 16,
        bold: true,
        color: this.colors.primary
      });
      
      // Add value drivers as bullet points
      if (chapter.valueDrivers && chapter.valueDrivers.length > 0) {
        const driversText = chapter.valueDrivers.map(d => ({
          text: d,
          options: { bullet: true, color: this.colors.text, fontSize: 15 }
        }));
        
        slide.addText(driversText, {
          x: 0.8,
          y: 1.8,
          w: 8.5,
          h: 5.5,
          fontSize: 15,
          color: this.colors.text,
          valign: 'top',
          lineSpacing: 24,
          wrap: true
        });
      }
    }
    
  }


  /**
   * Get actual dimensions of an image from base64 data
   */
  async getImageDimensions(base64Data) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({ width: img.width, height: img.height });
      };
      img.onerror = () => {
        // If image fails to load, return default dimensions
        resolve({ width: 800, height: 600 });
      };
      img.src = base64Data;
    });
  }

  /**
   * Sanitize filename for download
   */
  sanitizeFileName(name) {
    return name.replace(/[^a-z0-9]/gi, '_').toLowerCase();
  }
}

// Create singleton instance
const pptExporter = new PPTExporter();

/**
 * Export story to PowerPoint
 * @param {Object} story - Story object to export
 * @param {Object} colorScheme - Optional color scheme to apply
 */
async function exportStoryToPPT(story, colorScheme = null) {
  if (!story) {
    alert('No story data to export');
    return;
  }
  
  try {
    // Show loading indicator
    showPPTExportProgress('Generating PowerPoint presentation...');
    
    // Get color scheme from settings if not provided
    if (!colorScheme) {
      colorScheme = await getColorSchemeFromSettings();
    }
    
    // Initialize with color scheme
    await pptExporter.init(colorScheme);
    
    // Export the story
    await pptExporter.exportStory(story);
    
    // Show success message
    showPPTExportProgress('PowerPoint exported successfully!', 'success');
    
    // Hide progress after 2 seconds
    setTimeout(() => {
      hidePPTExportProgress();
    }, 2000);
    
  } catch (error) {
    console.error('Error exporting to PPT:', error);
    showPPTExportProgress('Failed to export: ' + error.message, 'error');
    
    // Hide progress after 3 seconds
    setTimeout(() => {
      hidePPTExportProgress();
    }, 3000);
  }
}

/**
 * Get color scheme from Chrome storage
 */
async function getColorSchemeFromSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['colorScheme', 'customColors', 'savedCustomThemes'], (result) => {
      const schemeName = result.colorScheme || 'default';
      let scheme = null;
      
      // Define default color schemes
      const colorSchemes = {
        default: {
          primary: 'rgba(3, 45, 66, 1)',
          secondary: 'rgba(118, 97, 255, 1)',
          accent: 'rgba(99, 223, 78, 1)',
          background: 'rgba(248, 250, 252, 1)',
          text: 'rgba(31, 41, 55, 1)',
          textLight: 'rgba(107, 114, 128, 1)'
        },
        'blue-green': {
          primary: 'rgba(0, 119, 182, 1)',
          secondary: 'rgba(0, 180, 216, 1)',
          accent: 'rgba(144, 224, 239, 1)',
          background: 'rgba(248, 250, 252, 1)',
          text: 'rgba(31, 41, 55, 1)',
          textLight: 'rgba(107, 114, 128, 1)'
        },
        purple: {
          primary: 'rgba(147, 51, 234, 1)',
          secondary: 'rgba(168, 85, 247, 1)',
          accent: 'rgba(196, 181, 253, 1)',
          background: 'rgba(248, 250, 252, 1)',
          text: 'rgba(31, 41, 55, 1)',
          textLight: 'rgba(107, 114, 128, 1)'
        },
        orange: {
          primary: 'rgba(234, 88, 12, 1)',
          secondary: 'rgba(249, 115, 22, 1)',
          accent: 'rgba(251, 191, 36, 1)',
          background: 'rgba(248, 250, 252, 1)',
          text: 'rgba(31, 41, 55, 1)',
          textLight: 'rgba(107, 114, 128, 1)'
        },
        dark: {
          primary: 'rgba(17, 24, 39, 1)',
          secondary: 'rgba(31, 41, 55, 1)',
          accent: 'rgba(75, 85, 99, 1)',
          background: 'rgba(55, 65, 81, 1)',
          text: 'rgba(243, 244, 246, 1)',
          textLight: 'rgba(156, 163, 175, 1)'
        },
        rogers: {
          primary: 'rgba(0, 102, 204, 1)',
          secondary: 'rgba(0, 123, 191, 1)',
          accent: 'rgba(255, 255, 255, 1)',
          background: 'rgba(248, 250, 252, 1)',
          text: 'rgba(31, 41, 55, 1)',
          textLight: 'rgba(107, 114, 128, 1)'
        },
        custom: {
          primary: result.customColors?.primary || 'rgba(3, 45, 66, 1)',
          secondary: result.customColors?.secondary || 'rgba(118, 97, 255, 1)',
          accent: result.customColors?.accent || 'rgba(99, 223, 78, 1)',
          background: result.customColors?.background || 'rgba(248, 250, 252, 1)',
          text: result.customColors?.text || 'rgba(31, 41, 55, 1)',
          textLight: result.customColors?.textLight || 'rgba(107, 114, 128, 1)'
        }
      };
      
      // Check if it's a saved custom theme
      if (schemeName.startsWith('saved-')) {
        const themeName = schemeName.replace('saved-', '');
        if (result.savedCustomThemes && result.savedCustomThemes[themeName]) {
          const savedTheme = result.savedCustomThemes[themeName];
          scheme = {
            primary: savedTheme.colors?.primary || 'rgba(3, 45, 66, 1)',
            secondary: savedTheme.colors?.secondary || 'rgba(118, 97, 255, 1)',
            accent: savedTheme.colors?.accent || 'rgba(99, 223, 78, 1)',
            background: savedTheme.colors?.background || 'rgba(248, 250, 252, 1)',
            text: savedTheme.colors?.text || 'rgba(31, 41, 55, 1)',
            textLight: savedTheme.colors?.textLight || 'rgba(107, 114, 128, 1)'
          };
        }
      } else {
        scheme = colorSchemes[schemeName] || colorSchemes.default;
      }
      
      resolve(scheme);
    });
  });
}

/**
 * Show PPT export progress/status
 */
function showPPTExportProgress(message, type = 'info') {
  // Remove existing progress indicator
  hidePPTExportProgress();
  
  const progress = document.createElement('div');
  progress.id = 'pptExportProgress';
  progress.className = 'ppt-export-progress';
  
  const bgColor = type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6';
  const icon = type === 'success' ? '✓' : type === 'error' ? '✕' : '⏳';
  
  progress.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: ${bgColor};
    color: white;
    padding: 16px 24px;
    border-radius: 8px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
    z-index: 10002;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 500;
    max-width: 350px;
    animation: slideInRight 0.3s ease-out;
  `;
  
  progress.innerHTML = `
    <div style="display: flex; align-items: center; gap: 12px;">
      <span style="font-size: 20px;">${icon}</span>
      <span>${message}</span>
    </div>
  `;
  
  document.body.appendChild(progress);
}

/**
 * Hide PPT export progress
 */
function hidePPTExportProgress() {
  const existing = document.getElementById('pptExportProgress');
  if (existing) {
    existing.remove();
  }
}

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PPTExporter, exportStoryToPPT };
}
