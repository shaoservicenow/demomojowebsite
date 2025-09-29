// Global variables
let selectedStoryIndex = 'all'; // 'all' or index number

// Available headshot images for fallback
const availableHeadshots = [
  'blake.png',
  'elle.png', 
  'jim.png',
  'kate.png',
  'nick.png',
  'patty.png',
  'taylor.png'
];

function getConsistentHeadshot(personaName, personaIndex = null) {
  // Use persona name to generate a consistent index
  let hash = 0;
  for (let i = 0; i < personaName.length; i++) {
    const char = personaName.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  // Use absolute value and modulo to get a valid index
  const index = Math.abs(hash) % availableHeadshots.length;
  return chrome.runtime.getURL(`headshots/${availableHeadshots[index]}`);
}

// Load the header logo
document.addEventListener('DOMContentLoaded', function() {
  const logo = document.getElementById('header-logo');
  if (logo && chrome.runtime) {
    logo.src = chrome.runtime.getURL('icons/logo-solo.png');
  }
});

function render() {
  // Check if chrome.storage is available
  if (typeof chrome === 'undefined' || !chrome.storage) {
    const container = document.getElementById("stories");
    container.innerHTML = `
      <div class="empty-state">
        <h3>Extension Context Required</h3>
        <p>Please open this page through the extension's options menu or right-click the extension icon and select "Options"</p>
      </div>
    `;
    return;
  }

  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const container = document.getElementById("stories");
    const storySelect = document.getElementById("storySelect");
    
    // Populate story dropdown
    populateStoryDropdown(stories);
    
    container.innerHTML = "";

    if (stories.length === 0) {
      container.innerHTML = `
        <div class="empty-state">
          <h3>No stories yet</h3>
          <p>Create your first demo story to get started</p>
        </div>
      `;
      return;
    }

    // Render stories based on selection
    renderStories(stories);
  });
}

// Populate story dropdown
function populateStoryDropdown(stories) {
  const storySelect = document.getElementById("storySelect");
  if (!storySelect) return;
  
  // Clear existing options except "View All Stories"
  storySelect.innerHTML = '<option value="all">View All Stories</option>';
  
  // Add individual story options
  stories.forEach((story, index) => {
    const option = document.createElement("option");
    option.value = index;
    option.textContent = story.name;
    storySelect.appendChild(option);
  });
  
  // Set current selection
  storySelect.value = selectedStoryIndex;
  
  // Update export button visibility
  toggleExportButtonVisibility();
}

// Render stories based on current selection
function renderStories(stories) {
  const container = document.getElementById("stories");
  if (!container) return;
  
  container.innerHTML = "";
  
  if (selectedStoryIndex === 'all') {
    // Render all stories
    stories.forEach((story, sIndex) => {
      renderSingleStory(story, sIndex, container);
    });
  } else {
    // Render only selected story
    const storyIndex = parseInt(selectedStoryIndex);
    if (storyIndex >= 0 && storyIndex < stories.length) {
      renderSingleStory(stories[storyIndex], storyIndex, container);
    }
  }
}

// Render a single story
function renderSingleStory(story, sIndex, container) {
  const storyDiv = document.createElement("div");
  storyDiv.className = "story";
  storyDiv.innerHTML = `
    <div class="story-header">
      <div class="story-title">${story.name}</div>
      <div class="story-actions">
        <button class="btn btn-primary edit-story-btn" data-index="${sIndex}">Edit</button>
        <button class="btn btn-danger delete-story-btn" data-index="${sIndex}">Delete</button>
      </div>
    </div>
  `;
  
  // Personas
  story.personas.forEach((persona, pIndex) => {
    const personaDiv = document.createElement("div");
    personaDiv.className = "persona";
    personaDiv.setAttribute("data-story-index", sIndex);
    personaDiv.setAttribute("data-persona-index", pIndex);
    personaDiv.innerHTML = `
      <div class="persona-header">
        <div class="persona-info">
          ${persona.headshot ? `<img src="${persona.headshot}" class="headshot-preview" alt="${persona.name}">` : ''}
          <div class="persona-details">
            <h3>${persona.name}</h3>
            ${persona.businessTitle ? `<p>${persona.businessTitle}</p>` : ''}
          </div>
        </div>
        <div class="persona-actions">
          <div class="persona-reorder">
            <button class="btn btn-sm btn-secondary move-persona-up-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}" title="Move Up" ${pIndex === 0 ? 'disabled' : ''}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m18 15-6-6-6 6"/>
              </svg>
            </button>
            <button class="btn btn-sm btn-secondary move-persona-down-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}" title="Move Down" ${pIndex === story.personas.length - 1 ? 'disabled' : ''}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="m6 9 6 6 6-6"/>
              </svg>
            </button>
          </div>
          <button class="btn btn-primary edit-persona-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}">Edit</button>
          <button class="btn btn-danger delete-persona-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}">Delete</button>
        </div>
      </div>
    `;
  
    // Chapters
    persona.chapters.forEach((chapter, cIndex) => {
      const chapterDiv = document.createElement("div");
      chapterDiv.className = "chapter";
      chapterDiv.setAttribute("data-story-index", sIndex);
      chapterDiv.setAttribute("data-persona-index", pIndex);
      chapterDiv.setAttribute("data-chapter-index", cIndex);
      chapterDiv.innerHTML = `
        <div class="chapter-header">
          <div class="chapter-title">
            <div class="chapter-title-row">
              <div class="chapter-movement">
                <button class="btn btn-xs btn-secondary move-chapter-up-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}" data-chapter-index="${cIndex}" title="Move Up" ${cIndex === 0 ? 'disabled' : ''}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m18 15-6-6-6 6"/>
                  </svg>
                </button>
                <button class="btn btn-xs btn-secondary move-chapter-down-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}" data-chapter-index="${cIndex}" title="Move Down" ${cIndex === persona.chapters.length - 1 ? 'disabled' : ''}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="m6 9 6 6 6-6"/>
                  </svg>
                </button>
              </div>
              <span class="chapter-number">${cIndex + 1}.</span> ${chapter.title}
            </div>
            <div class="chapter-url" data-story-index="${sIndex}" data-persona-index="${pIndex}" data-chapter-index="${cIndex}">
              ${chapter.url ? `<span class="url-text">${chapter.url}</span>` : '<span class="url-placeholder">No URL set (double-click to add)</span>'}
            </div>
          </div>
          <div class="chapter-actions">
            <button class="btn btn-sm btn-primary edit-chapter-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}" data-chapter-index="${cIndex}">Edit</button>
            <button class="btn btn-sm btn-danger delete-chapter-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}" data-chapter-index="${cIndex}">Delete</button>
          </div>
        </div>
        <ul class="drivers">
          ${chapter.valueDrivers.map((driver, dIndex) => `
            <li data-story-index="${sIndex}" data-persona-index="${pIndex}" data-chapter-index="${cIndex}" data-driver-index="${dIndex}">
              <div class="driver-content">
                <div class="driver-movement">
                  <button class="btn btn-xs btn-secondary move-driver-up-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}" data-chapter-index="${cIndex}" data-driver-index="${dIndex}" title="Move Up" ${dIndex === 0 ? 'disabled' : ''}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m18 15-6-6-6 6"/>
                    </svg>
                  </button>
                  <button class="btn btn-xs btn-secondary move-driver-down-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}" data-chapter-index="${cIndex}" data-driver-index="${dIndex}" title="Move Down" ${dIndex === chapter.valueDrivers.length - 1 ? 'disabled' : ''}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <path d="m6 9 6 6 6-6"/>
                    </svg>
                  </button>
                </div>
                <span class="driver-text">${driver}</span>
              </div>
              <div class="driver-actions">
                <button class="driver-action-btn edit-value-driver-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}" data-chapter-index="${cIndex}" data-driver-index="${dIndex}" title="Edit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                  </svg>
                </button>
                <button class="driver-action-btn delete-value-driver-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}" data-chapter-index="${cIndex}" data-driver-index="${dIndex}" title="Delete">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="3,6 5,6 21,6"></polyline>
                    <path d="M19,6v14a2,2 0 0,1 -2,2H7a2,2 0 0,1 -2,-2V6m3,0V4a2,2 0 0,1 2,-2h4a2,2 0 0,1 2,2v2"></path>
                    <line x1="10" y1="11" x2="10" y2="17"></line>
                    <line x1="14" y1="11" x2="14" y2="17"></line>
                  </svg>
                </button>
              </div>
            </li>
          `).join('')}
        </ul>
        <button class="btn btn-primary add-value-driver-btn" data-story-index="${sIndex}" data-persona-index="${pIndex}" data-chapter-index="${cIndex}" style="margin-top: 8px;">+ Add Value Driver</button>
      `;
  
      personaDiv.appendChild(chapterDiv);
    });
  
    // Add chapter button
    const addChapterBtn = document.createElement("button");
    addChapterBtn.className = "btn btn-primary add-chapter-btn";
    addChapterBtn.textContent = "+ Add Chapter";
    addChapterBtn.setAttribute("data-story-index", sIndex);
    addChapterBtn.setAttribute("data-persona-index", pIndex);
    addChapterBtn.style.marginTop = "16px";
    personaDiv.appendChild(addChapterBtn);
  
    storyDiv.appendChild(personaDiv);
  });
  
  // Add persona button
  const addPersonaBtn = document.createElement("button");
  addPersonaBtn.className = "btn btn-primary add-persona-btn";
  addPersonaBtn.textContent = "+ Add Persona";
  addPersonaBtn.setAttribute("data-story-index", sIndex);
  addPersonaBtn.style.marginTop = "16px";
  storyDiv.appendChild(addPersonaBtn);
  
  container.appendChild(storyDiv);
}
  
// Story management functions
function addStory() {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    alert('Extension context required. Please open through the extension options.');
    return;
  }
  
  const name = prompt("Story name?");
  if (!name) return;
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    stories.push({ name, personas: [] });
    
    // Set the newly created story as selected (it will be the last story in the array)
    selectedStoryIndex = stories.length - 1;
    
    chrome.storage.local.set({ stories }, () => {
      render();
      // Show donation popup for new story creation with 2-second delay
      setTimeout(() => {
        showDonationPopup();
      }, 2000);
    });
  });
}

function editStory(index) {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    alert('Extension context required. Please open through the extension options.');
    return;
  }
  
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const newName = prompt("Story name?", stories[index].name);
    if (newName && newName !== stories[index].name) {
      stories[index].name = newName;
      chrome.storage.local.set({ stories }, () => {
        render();
      });
    }
  });
}

function deleteStory(index) {
  if (typeof chrome === 'undefined' || !chrome.storage) {
    alert('Extension context required. Please open through the extension options.');
    return;
  }
  
  if (confirm("Are you sure you want to delete this story?")) {
    chrome.storage.local.get(["stories"], (result) => {
      const stories = result.stories || [];
      stories.splice(index, 1);
      chrome.storage.local.set({ stories }, () => {
        render();
      });
    });
  }
}

// Persona management functions
let currentEditingPersona = null;

function addPersona(storyIndex) {
  currentEditingPersona = { storyIndex, personaIndex: null, isNew: true };
  openPersonaModal();
}

function editPersona(storyIndex, personaIndex) {
  currentEditingPersona = { storyIndex, personaIndex, isNew: false };
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const persona = stories[storyIndex].personas[personaIndex];
    document.getElementById('personaName').value = persona.name || '';
    document.getElementById('personaTitle').value = persona.businessTitle || '';
    
    if (persona.headshot) {
      document.getElementById('headshotImg').src = persona.headshot;
      document.getElementById('headshotPreview').style.display = 'block';
      document.getElementById('headshotUpload').style.display = 'none';
    } else {
      document.getElementById('headshotPreview').style.display = 'none';
      document.getElementById('headshotUpload').style.display = 'block';
    }
    
    openPersonaModal();
  });
}

function deletePersona(storyIndex, personaIndex) {
  if (confirm("Are you sure you want to delete this persona?")) {
    chrome.storage.local.get(["stories"], (result) => {
      const stories = result.stories || [];
      stories[storyIndex].personas.splice(personaIndex, 1);
      chrome.storage.local.set({ stories }, () => {
        render();
      });
    });
  }
}

function openPersonaModal() {
  document.getElementById('personaModal').style.display = 'block';
  document.getElementById('personaForm').reset();
  if (currentEditingPersona.isNew) {
    document.getElementById('headshotPreview').style.display = 'none';
    document.getElementById('headshotUpload').style.display = 'block';
  }
}

function closePersonaModal() {
  document.getElementById('personaModal').style.display = 'none';
  currentEditingPersona = null;
}

function savePersona() {
  const name = document.getElementById('personaName').value;
  if (!name) {
    alert('Please enter a persona name');
    return;
  }
  
  const title = document.getElementById('personaTitle').value;
  const headshotFile = document.getElementById('headshotFile').files[0];
  
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    
    if (currentEditingPersona.isNew) {
      // Add new persona
      const newPersona = {
        name,
        businessTitle: title,
        chapters: [],
        headshot: null
      };
      
      if (headshotFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
          newPersona.headshot = e.target.result;
          stories[currentEditingPersona.storyIndex].personas.push(newPersona);
          chrome.storage.local.set({ stories }, () => {
            closePersonaModal();
            render();
          });
        };
        reader.readAsDataURL(headshotFile);
      } else {
        // Assign a consistent fallback image based on persona name
        newPersona.fallbackHeadshot = getConsistentHeadshot(name);
        stories[currentEditingPersona.storyIndex].personas.push(newPersona);
        chrome.storage.local.set({ stories }, () => {
          closePersonaModal();
          render();
        });
      }
    } else {
      // Edit existing persona
      const persona = stories[currentEditingPersona.storyIndex].personas[currentEditingPersona.personaIndex];
      persona.name = name;
      persona.businessTitle = title;
      
      if (headshotFile) {
        const reader = new FileReader();
        reader.onload = function(e) {
          persona.headshot = e.target.result;
          chrome.storage.local.set({ stories }, () => {
            closePersonaModal();
            render();
          });
        };
        reader.readAsDataURL(headshotFile);
      } else {
        chrome.storage.local.set({ stories }, () => {
          closePersonaModal();
          render();
        });
      }
    }
  });
}

// Chapter management functions
function addChapter(storyIndex, personaIndex) {
  const title = prompt("Chapter title?");
  if (!title) return;
  const url = prompt("Chapter URL (optional):");
  
  // Ensure it's a full URL
  let fullUrl = null;
  if (url && url.trim()) {
    fullUrl = url.trim();
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }
  }
  
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    stories[storyIndex].personas[personaIndex].chapters.push({ 
      title, 
      valueDrivers: [],
      url: fullUrl
    });
    chrome.storage.local.set({ stories }, () => {
      render();
    });
  });
}

function editChapter(storyIndex, personaIndex, chapterIndex) {
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const chapter = stories[storyIndex].personas[personaIndex].chapters[chapterIndex];
    const newTitle = prompt("Chapter title?", chapter.title);
    if (newTitle && newTitle !== chapter.title) {
      chapter.title = newTitle;
    }
    const newUrl = prompt("Chapter URL (optional):", chapter.url || "");
    
    // Ensure it's a full URL
    let fullUrl = null;
    if (newUrl && newUrl.trim()) {
      fullUrl = newUrl.trim();
      if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
        fullUrl = 'https://' + fullUrl;
      }
    }
    
    chapter.url = fullUrl;
    chrome.storage.local.set({ stories }, () => {
      render();
    });
  });
}

function deleteChapter(storyIndex, personaIndex, chapterIndex) {
  if (confirm("Are you sure you want to delete this chapter?")) {
    chrome.storage.local.get(["stories"], (result) => {
      const stories = result.stories || [];
      stories[storyIndex].personas[personaIndex].chapters.splice(chapterIndex, 1);
      chrome.storage.local.set({ stories }, () => {
      render();
    });
    });
  }
}

// Value driver management functions
function addValueDriver(storyIndex, personaIndex, chapterIndex) {
  const driver = prompt("Value driver?");
  if (!driver) return;
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    stories[storyIndex].personas[personaIndex].chapters[chapterIndex].valueDrivers.push(driver);
    chrome.storage.local.set({ stories }, () => {
      render();
    });
  });
}

function editValueDriver(storyIndex, personaIndex, chapterIndex, driverIndex) {
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const currentDriver = stories[storyIndex].personas[personaIndex].chapters[chapterIndex].valueDrivers[driverIndex];
    const newDriver = prompt("Edit value driver:", currentDriver);
    if (newDriver && newDriver.trim() && newDriver !== currentDriver) {
      stories[storyIndex].personas[personaIndex].chapters[chapterIndex].valueDrivers[driverIndex] = newDriver.trim();
      chrome.storage.local.set({ stories }, () => {
      render();
    });
    }
  });
}

function deleteValueDriver(storyIndex, personaIndex, chapterIndex, driverIndex) {
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const driver = stories[storyIndex].personas[personaIndex].chapters[chapterIndex].valueDrivers[driverIndex];
    if (confirm(`Delete value driver: "${driver}"?`)) {
      stories[storyIndex].personas[personaIndex].chapters[chapterIndex].valueDrivers.splice(driverIndex, 1);
      chrome.storage.local.set({ stories }, () => {
  render();
    });
    }
  });
}

// Dark mode functionality
function initDarkMode() {
  const darkModeToggle = document.getElementById('darkModeToggle');
  const sunIcon = document.getElementById('sunIcon');
  const themeText = document.getElementById('themeText');
  
  // Check for saved theme preference or default to light mode
  const currentTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', currentTheme);
  
  if (currentTheme === 'dark') {
    themeText.textContent = 'Dark';
    sunIcon.innerHTML = `
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
    `;
  }
  
  darkModeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    if (newTheme === 'dark') {
      themeText.textContent = 'Dark';
      sunIcon.innerHTML = `
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      `;
    } else {
      themeText.textContent = 'Light';
      sunIcon.innerHTML = `
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      `;
    }
  });

  // Settings button functionality
  const settingsBtn = document.getElementById('settingsBtn');
  settingsBtn.addEventListener('click', () => {
    window.open('settings.html', '_blank');
  });
}

// Export selected story to JSON file
function exportSelectedStory() {
  const storySelect = document.getElementById('storySelect');
  const selectedValue = storySelect.value;
  
  console.log('Export attempt - selectedValue:', selectedValue);
  
  // Check if a valid story is selected (not "all" or invalid)
  if (selectedValue === 'all' || selectedValue === '-1' || isNaN(parseInt(selectedValue))) {
    console.log('Invalid selection:', selectedValue);
    alert('Please select a story to export.');
    return;
  }
  
  const selectedStoryIndex = parseInt(selectedValue);
  
  // Use chrome storage instead of localStorage
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const story = stories[selectedStoryIndex];
    
    console.log('Export attempt - selectedStoryIndex:', selectedStoryIndex);
    console.log('Export attempt - stories length:', stories.length);
    console.log('Export attempt - stories array:', stories);
    console.log('Export attempt - story at index', selectedStoryIndex, ':', story);
    
    if (!story) {
      alert('Selected story not found.');
      return;
    }
    
    // Continue with export logic inside the chrome storage callback
    exportStoryData(story);
  });
}

// Separate function to handle the actual export after getting the story
function exportStoryData(story) {
  
  // Create export data with metadata
  const exportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    story: story
  };
  
  // Create and download file
  const dataStr = JSON.stringify(exportData, null, 2);
  const dataBlob = new Blob([dataStr], { type: 'application/json' });
  const url = URL.createObjectURL(dataBlob);
  
  const link = document.createElement('a');
  link.href = url;
  link.download = `${story.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_story.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
  
  console.log('Story exported:', story.name);
}

// Import story from JSON file
function importStoryFromFile(event) {
  const file = event.target.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const importData = JSON.parse(e.target.result);
      
      // Validate import data
      if (!importData.story || !importData.story.name) {
        alert('Invalid story file format.');
        return;
      }
      
      // Use chrome storage instead of localStorage
      chrome.storage.local.get(["stories"], (result) => {
        const stories = result.stories || [];
        const existingStory = stories.find(s => s.name === importData.story.name);
        
        if (existingStory) {
          const overwrite = confirm(`A story named "${importData.story.name}" already exists. Do you want to replace it?`);
          if (!overwrite) return;
          
          // Replace existing story
          const index = stories.findIndex(s => s.name === importData.story.name);
          stories[index] = importData.story;
        } else {
          // Add new story
          stories.push(importData.story);
        }
        
        // Save to chrome storage
        chrome.storage.local.set({ stories }, () => {
          // Refresh the UI
          render();
          populateStoryDropdown(stories);
          
          // Show donation popup for new story creation with 2-second delay
          if (!existingStory) {
            setTimeout(() => {
              showDonationPopup();
            }, 2000);
          }
          
          // Select the imported story
          const storyIndex = stories.findIndex(s => s.name === importData.story.name);
          document.getElementById('storySelect').value = storyIndex;
          
          alert(`Story "${importData.story.name}" imported successfully!`);
          console.log('Story imported:', importData.story.name);
        });
      });
      
    } catch (error) {
      console.error('Error importing story:', error);
      alert('Error importing story. Please check the file format.');
    }
  };
  
  reader.readAsText(file);
  
  // Reset file input
  event.target.value = '';
}

// Toggle export button visibility based on story selection
function toggleExportButtonVisibility() {
  const exportBtn = document.getElementById('exportStory');
  const storySelect = document.getElementById('storySelect');
  
  if (exportBtn && storySelect) {
    const selectedValue = storySelect.value;
    const isStorySelected = selectedValue !== 'all' && selectedValue !== '-1' && !isNaN(parseInt(selectedValue));
    
    exportBtn.style.display = isStorySelected ? 'inline-flex' : 'none';
  }
}

// Add event listeners for all buttons
function addEventListeners() {
  // Story selector dropdown
  const storySelect = document.getElementById('storySelect');
  if (storySelect) {
    storySelect.addEventListener('change', (e) => {
      selectedStoryIndex = e.target.value;
      render(); // Re-render with new selection
      toggleExportButtonVisibility(); // Show/hide export button
    });
  }
  
  // Refresh stories button
  const refreshBtn = document.getElementById('refreshStories');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      render(); // Re-render all stories
    });
  }
  
  // Add Story button
  document.getElementById('addStory').addEventListener('click', addStory);
  
  // Donation popup event handlers
  document.getElementById('donation-modal-close').addEventListener('click', hideDonationPopup);
  document.getElementById('donation-modal-later').addEventListener('click', hideDonationPopup);
  
  // Close modal when clicking outside
  document.getElementById('donation-modal').addEventListener('click', (e) => {
    if (e.target.id === 'donation-modal') {
      hideDonationPopup();
    }
  });
  
  // Export Story button
  document.getElementById('exportStory').addEventListener('click', exportSelectedStory);
  
  // Import Story button
  document.getElementById('importStory').addEventListener('click', () => {
    document.getElementById('importFileInput').click();
  });
  
  // Import file input
  document.getElementById('importFileInput').addEventListener('change', importStoryFromFile);
  
  // Story buttons
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('edit-story-btn')) {
      const index = parseInt(e.target.getAttribute('data-index'));
      editStory(index);
    } else if (e.target.classList.contains('delete-story-btn')) {
      const index = parseInt(e.target.getAttribute('data-index'));
      deleteStory(index);
    } else if (e.target.classList.contains('add-persona-btn')) {
      const storyIndex = parseInt(e.target.getAttribute('data-story-index'));
      addPersona(storyIndex);
    } else if (e.target.classList.contains('edit-persona-btn')) {
      const storyIndex = parseInt(e.target.getAttribute('data-story-index'));
      const personaIndex = parseInt(e.target.getAttribute('data-persona-index'));
      editPersona(storyIndex, personaIndex);
    } else if (e.target.classList.contains('delete-persona-btn')) {
      const storyIndex = parseInt(e.target.getAttribute('data-story-index'));
      const personaIndex = parseInt(e.target.getAttribute('data-persona-index'));
      deletePersona(storyIndex, personaIndex);
    } else if (e.target.closest('.move-persona-up-btn')) {
      const button = e.target.closest('.move-persona-up-btn');
      const storyIndex = parseInt(button.getAttribute('data-story-index'));
      const personaIndex = parseInt(button.getAttribute('data-persona-index'));
      movePersonaUp(storyIndex, personaIndex);
    } else if (e.target.closest('.move-persona-down-btn')) {
      const button = e.target.closest('.move-persona-down-btn');
      const storyIndex = parseInt(button.getAttribute('data-story-index'));
      const personaIndex = parseInt(button.getAttribute('data-persona-index'));
      movePersonaDown(storyIndex, personaIndex);
    } else if (e.target.closest('.move-chapter-up-btn')) {
      const button = e.target.closest('.move-chapter-up-btn');
      const storyIndex = parseInt(button.getAttribute('data-story-index'));
      const personaIndex = parseInt(button.getAttribute('data-persona-index'));
      const chapterIndex = parseInt(button.getAttribute('data-chapter-index'));
      moveChapterUp(storyIndex, personaIndex, chapterIndex);
    } else if (e.target.closest('.move-chapter-down-btn')) {
      const button = e.target.closest('.move-chapter-down-btn');
      const storyIndex = parseInt(button.getAttribute('data-story-index'));
      const personaIndex = parseInt(button.getAttribute('data-persona-index'));
      const chapterIndex = parseInt(button.getAttribute('data-chapter-index'));
      moveChapterDown(storyIndex, personaIndex, chapterIndex);
    } else if (e.target.closest('.move-driver-up-btn')) {
      const button = e.target.closest('.move-driver-up-btn');
      const storyIndex = parseInt(button.getAttribute('data-story-index'));
      const personaIndex = parseInt(button.getAttribute('data-persona-index'));
      const chapterIndex = parseInt(button.getAttribute('data-chapter-index'));
      const driverIndex = parseInt(button.getAttribute('data-driver-index'));
      moveDriverUp(storyIndex, personaIndex, chapterIndex, driverIndex);
    } else if (e.target.closest('.move-driver-down-btn')) {
      const button = e.target.closest('.move-driver-down-btn');
      const storyIndex = parseInt(button.getAttribute('data-story-index'));
      const personaIndex = parseInt(button.getAttribute('data-persona-index'));
      const chapterIndex = parseInt(button.getAttribute('data-chapter-index'));
      const driverIndex = parseInt(button.getAttribute('data-driver-index'));
      moveDriverDown(storyIndex, personaIndex, chapterIndex, driverIndex);
    } else if (e.target.classList.contains('add-chapter-btn')) {
      const storyIndex = parseInt(e.target.getAttribute('data-story-index'));
      const personaIndex = parseInt(e.target.getAttribute('data-persona-index'));
      addChapter(storyIndex, personaIndex);
    } else if (e.target.classList.contains('edit-chapter-btn')) {
      const storyIndex = parseInt(e.target.getAttribute('data-story-index'));
      const personaIndex = parseInt(e.target.getAttribute('data-persona-index'));
      const chapterIndex = parseInt(e.target.getAttribute('data-chapter-index'));
      editChapter(storyIndex, personaIndex, chapterIndex);
    } else if (e.target.classList.contains('delete-chapter-btn')) {
      const storyIndex = parseInt(e.target.getAttribute('data-story-index'));
      const personaIndex = parseInt(e.target.getAttribute('data-persona-index'));
      const chapterIndex = parseInt(e.target.getAttribute('data-chapter-index'));
      deleteChapter(storyIndex, personaIndex, chapterIndex);
    } else if (e.target.classList.contains('add-value-driver-btn')) {
      const storyIndex = parseInt(e.target.getAttribute('data-story-index'));
      const personaIndex = parseInt(e.target.getAttribute('data-persona-index'));
      const chapterIndex = parseInt(e.target.getAttribute('data-chapter-index'));
      addValueDriver(storyIndex, personaIndex, chapterIndex);
    } else if (e.target.closest('.edit-value-driver-btn')) {
      const button = e.target.closest('.edit-value-driver-btn');
      const storyIndex = parseInt(button.getAttribute('data-story-index'));
      const personaIndex = parseInt(button.getAttribute('data-persona-index'));
      const chapterIndex = parseInt(button.getAttribute('data-chapter-index'));
      const driverIndex = parseInt(button.getAttribute('data-driver-index'));
      editValueDriver(storyIndex, personaIndex, chapterIndex, driverIndex);
    } else if (e.target.closest('.delete-value-driver-btn')) {
      const button = e.target.closest('.delete-value-driver-btn');
      const storyIndex = parseInt(button.getAttribute('data-story-index'));
      const personaIndex = parseInt(button.getAttribute('data-persona-index'));
      const chapterIndex = parseInt(button.getAttribute('data-chapter-index'));
      const driverIndex = parseInt(button.getAttribute('data-driver-index'));
      deleteValueDriver(storyIndex, personaIndex, chapterIndex, driverIndex);
    } else if (e.target.classList.contains('close') || e.target.id === 'cancelPersona') {
      closePersonaModal();
    } else if (e.target.id === 'removeHeadshot') {
      document.getElementById('headshotImg').src = '';
      document.getElementById('headshotPreview').style.display = 'none';
      document.getElementById('headshotUpload').style.display = 'block';
      document.getElementById('headshotFile').value = '';
    }
  });

  // Modal close on outside click
  document.getElementById('personaModal').addEventListener('click', (e) => {
    if (e.target.id === 'personaModal') {
      closePersonaModal();
    }
  });

  // Persona form submission
  document.getElementById('personaForm').addEventListener('submit', (e) => {
    e.preventDefault();
    savePersona();
  });

  // File upload click handler
  document.getElementById('headshotUpload').addEventListener('click', () => {
    document.getElementById('headshotFile').click();
  });

  // File upload preview
  document.getElementById('headshotFile').addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(e) {
        document.getElementById('headshotImg').src = e.target.result;
        document.getElementById('headshotPreview').style.display = 'block';
        document.getElementById('headshotUpload').style.display = 'none';
      };
      reader.readAsDataURL(file);
    }
  });

  // URL editing functionality
  document.addEventListener('dblclick', (e) => {
    if (e.target.closest('.chapter-url')) {
      const urlElement = e.target.closest('.chapter-url');
      const storyIndex = parseInt(urlElement.getAttribute('data-story-index'));
      const personaIndex = parseInt(urlElement.getAttribute('data-persona-index'));
      const chapterIndex = parseInt(urlElement.getAttribute('data-chapter-index'));
      
      editChapterUrlInline(urlElement, storyIndex, personaIndex, chapterIndex);
    }
  });
}

// Inline URL editing function
function editChapterUrlInline(urlElement, storyIndex, personaIndex, chapterIndex) {
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const chapter = stories[storyIndex].personas[personaIndex].chapters[chapterIndex];
    const currentUrl = chapter.url || '';
    
    // Create input element
    const input = document.createElement('input');
    input.type = 'text';
    input.className = 'url-input';
    input.value = currentUrl;
    input.placeholder = 'Enter URL...';
    
    // Replace content with input
    urlElement.innerHTML = '';
    urlElement.appendChild(input);
    input.focus();
    input.select();
    
    // Handle save on blur or enter
    const saveUrl = () => {
      let newUrl = input.value.trim();
      
      // Ensure it's a full URL
      if (newUrl && !newUrl.startsWith('http://') && !newUrl.startsWith('https://')) {
        newUrl = 'https://' + newUrl;
      }
      
      chapter.url = newUrl || null;
      
      chrome.storage.local.set({ stories }, () => {
        // Update display
        if (newUrl) {
          urlElement.innerHTML = `<span class="url-text">${newUrl}</span>`;
        } else {
          urlElement.innerHTML = '<span class="url-placeholder">No URL set (double-click to add)</span>';
        }
      });
    };
    
    // Handle cancel on escape
    const cancelEdit = () => {
      if (currentUrl) {
        urlElement.innerHTML = `<span class="url-text">${currentUrl}</span>`;
      } else {
        urlElement.innerHTML = '<span class="url-placeholder">No URL set (double-click to add)</span>';
      }
    };
    
    input.addEventListener('blur', saveUrl);
    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveUrl();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        cancelEdit();
      }
    });
  });
}

// Confetti magic effect
function createConfettiBurst(element) {
  const confettiContainer = document.createElement('div');
  confettiContainer.className = 'confetti-container';
  
  // Get element position for confetti positioning
  const rect = element.getBoundingClientRect();
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
  
  // Position confetti container behind the element, extending upward
  confettiContainer.style.top = (rect.top + scrollTop - 100) + 'px'; // Start 100px above element
  confettiContainer.style.left = (rect.left + scrollLeft) + 'px';
  confettiContainer.style.width = rect.width + 'px';
  confettiContainer.style.height = (rect.height + 150) + 'px'; // Extend 150px above element
  
  // Create magic confetti particles - positioned along the top edge
  const particleTypes = ['confetti-particle', 'confetti-star', 'confetti-sparkle'];
  const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3', '#ffd700', '#ffed4e'];
  
  for (let i = 0; i < 20; i++) {
    const particle = document.createElement('div');
    const type = particleTypes[Math.floor(Math.random() * particleTypes.length)];
    particle.className = type;
    
    // Position particles along the top edge of the container (element's top)
    const topEdgePosition = (rect.height + 100) / (rect.height + 150) * 100; // Position at element's top edge
    
    // Create dual-corner burst: half particles from left corner, half from right corner
    let horizontalPosition, burstDirection;
    if (i < 10) {
      // Left corner burst (first 10 particles)
      horizontalPosition = 0; // Left edge
      burstDirection = 'right'; // Burst toward the right
    } else {
      // Right corner burst (last 10 particles)
      horizontalPosition = 100; // Right edge
      burstDirection = 'left'; // Burst toward the left
    }
    
    particle.style.left = horizontalPosition + '%';
    particle.style.top = topEdgePosition + '%';
    
    // Set horizontal burst movement based on corner
    const containerWidth = rect.width;
    const maxSpread = containerWidth * 0.8; // Spread up to 80% of container width
    let randomX;
    if (burstDirection === 'right') {
      // Left corner: burst toward right (positive X)
      randomX = Math.random() * maxSpread;
    } else {
      // Right corner: burst toward left (negative X)
      randomX = -(Math.random() * maxSpread);
    }
    particle.style.setProperty('--random-x', randomX + 'px');
    
    // Staggered delay for wave-like burst effect
    particle.style.animationDelay = (i * 0.03) + 's';
    
    // Random colors for particles
    if (type === 'confetti-particle') {
      const color = colors[Math.floor(Math.random() * colors.length)];
      particle.style.background = color;
    }
    
    confettiContainer.appendChild(particle);
  }
  
  // Add to body and remove after animation
  document.body.appendChild(confettiContainer);
  
  
  // Clean up after animation completes
  setTimeout(() => {
    if (confettiContainer.parentNode) {
      confettiContainer.parentNode.removeChild(confettiContainer);
    }
  }, 1000);
}

// Persona movement functions
function movePersonaUp(storyIndex, personaIndex) {
  
  if (personaIndex <= 0) return; // Already at top
  
  // Add animation class
  const personaElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${personaIndex}"]`);
  if (personaElement) {
    personaElement.classList.add('moving-up');
  }
  
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const personas = stories[storyIndex].personas;
    
    // Swap with previous persona
    [personas[personaIndex], personas[personaIndex - 1]] = [personas[personaIndex - 1], personas[personaIndex]];
    
    chrome.storage.local.set({ stories }, () => {
      // Delay re-render to allow animation to complete
      setTimeout(() => {
        render();
        // Scroll the moved persona into view
        setTimeout(() => {
          const movedPersonaIndex = personaIndex - 1; // Persona moved up one position
          const movedPersonaElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${movedPersonaIndex}"]`);
          if (movedPersonaElement) {
            // Get the element's position and scroll to show it with some padding from top
            const elementRect = movedPersonaElement.getBoundingClientRect();
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetScrollTop = currentScrollTop + elementRect.top - 20; // 20px padding from top
            
            window.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            });
            
            // Add magical confetti burst after scroll completes
            setTimeout(() => {
              createConfettiBurst(movedPersonaElement);
            }, 500);
          }
        }, 100); // Small delay to ensure DOM is updated
      }, 250);
    });
  });
}

function movePersonaDown(storyIndex, personaIndex) {
  
  // Add animation class
  const personaElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${personaIndex}"]`);
  if (personaElement) {
    personaElement.classList.add('moving-down');
  }
  
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const personas = stories[storyIndex].personas;
    
    if (personaIndex >= personas.length - 1) return; // Already at bottom
    
    // Swap with next persona
    [personas[personaIndex], personas[personaIndex + 1]] = [personas[personaIndex + 1], personas[personaIndex]];
    
    chrome.storage.local.set({ stories }, () => {
      // Delay re-render to allow animation to complete
      setTimeout(() => {
        render();
        // Scroll the moved persona into view
        setTimeout(() => {
          const movedPersonaIndex = personaIndex + 1; // Persona moved down one position
          const movedPersonaElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${movedPersonaIndex}"]`);
          if (movedPersonaElement) {
            // Get the element's position and scroll to show it with some padding from top
            const elementRect = movedPersonaElement.getBoundingClientRect();
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetScrollTop = currentScrollTop + elementRect.top - 20; // 20px padding from top
            
            window.scrollTo({
              top: targetScrollTop,
              behavior: 'smooth'
            });
            
            // Add magical confetti burst after scroll completes
            setTimeout(() => {
              createConfettiBurst(movedPersonaElement);
            }, 500);
          }
        }, 100); // Small delay to ensure DOM is updated
      }, 250);
    });
  });
}

// Chapter movement functions
function moveChapterUp(storyIndex, personaIndex, chapterIndex) {
  
  if (chapterIndex <= 0) return; // Already at top
  
  // Add animation class
  const chapterElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${personaIndex}"][data-chapter-index="${chapterIndex}"]`);
  if (chapterElement && chapterElement.closest('.chapter')) {
    chapterElement.closest('.chapter').classList.add('moving-up');
  }
  
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const chapters = stories[storyIndex].personas[personaIndex].chapters;

    // Swap with previous chapter
    [chapters[chapterIndex], chapters[chapterIndex - 1]] = [chapters[chapterIndex - 1], chapters[chapterIndex]];

    chrome.storage.local.set({ stories }, () => {
      // Delay re-render to allow animation to complete
      setTimeout(() => {
        render();
        
        // Add magical confetti burst after re-render
        setTimeout(() => {
          const movedChapterIndex = chapterIndex - 1; // Chapter moved up one position
          const movedChapterElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${personaIndex}"][data-chapter-index="${movedChapterIndex}"]`);
          if (movedChapterElement && movedChapterElement.closest('.chapter')) {
            createConfettiBurst(movedChapterElement.closest('.chapter'));
          }
        }, 100);
      }, 250);
    });
  });
}

function moveChapterDown(storyIndex, personaIndex, chapterIndex) {
  
  // Add animation class
  const chapterElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${personaIndex}"][data-chapter-index="${chapterIndex}"]`);
  if (chapterElement && chapterElement.closest('.chapter')) {
    chapterElement.closest('.chapter').classList.add('moving-down');
  }
  
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const chapters = stories[storyIndex].personas[personaIndex].chapters;

    if (chapterIndex >= chapters.length - 1) return; // Already at bottom

    // Swap with next chapter
    [chapters[chapterIndex], chapters[chapterIndex + 1]] = [chapters[chapterIndex + 1], chapters[chapterIndex]];

    chrome.storage.local.set({ stories }, () => {
      // Delay re-render to allow animation to complete
      setTimeout(() => {
        render();
        
        // Add magical confetti burst after re-render
        setTimeout(() => {
          const movedChapterIndex = chapterIndex + 1; // Chapter moved down one position
          const movedChapterElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${personaIndex}"][data-chapter-index="${movedChapterIndex}"]`);
          if (movedChapterElement && movedChapterElement.closest('.chapter')) {
            createConfettiBurst(movedChapterElement.closest('.chapter'));
          }
        }, 100);
      }, 250);
    });
  });
}

// Driver movement functions
function moveDriverUp(storyIndex, personaIndex, chapterIndex, driverIndex) {
  
  if (driverIndex <= 0) return; // Already at top
  
  // Add animation class
  const driverElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${personaIndex}"][data-chapter-index="${chapterIndex}"][data-driver-index="${driverIndex}"]`);
  if (driverElement && driverElement.closest('li')) {
    driverElement.closest('li').classList.add('moving-up');
  }
  
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const drivers = stories[storyIndex].personas[personaIndex].chapters[chapterIndex].valueDrivers;

    // Swap with previous driver
    [drivers[driverIndex], drivers[driverIndex - 1]] = [drivers[driverIndex - 1], drivers[driverIndex]];

    chrome.storage.local.set({ stories }, () => {
      // Delay re-render to allow animation to complete
      setTimeout(() => {
        render();
        
        // Add magical confetti burst after re-render
        setTimeout(() => {
          const movedDriverIndex = driverIndex - 1; // Driver moved up one position
          const movedDriverElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${personaIndex}"][data-chapter-index="${chapterIndex}"][data-driver-index="${movedDriverIndex}"]`);
          if (movedDriverElement && movedDriverElement.closest('li')) {
            createConfettiBurst(movedDriverElement.closest('li'));
          }
        }, 100);
      }, 250);
    });
  });
}

function moveDriverDown(storyIndex, personaIndex, chapterIndex, driverIndex) {
  
  // Add animation class
  const driverElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${personaIndex}"][data-chapter-index="${chapterIndex}"][data-driver-index="${driverIndex}"]`);
  if (driverElement && driverElement.closest('li')) {
    driverElement.closest('li').classList.add('moving-down');
  }
  
  chrome.storage.local.get(["stories"], (result) => {
    const stories = result.stories || [];
    const drivers = stories[storyIndex].personas[personaIndex].chapters[chapterIndex].valueDrivers;

    if (driverIndex >= drivers.length - 1) return; // Already at bottom

    // Swap with next driver
    [drivers[driverIndex], drivers[driverIndex + 1]] = [drivers[driverIndex + 1], drivers[driverIndex]];

    chrome.storage.local.set({ stories }, () => {
      // Delay re-render to allow animation to complete
      setTimeout(() => {
        render();
        
        // Add magical confetti burst after re-render
        setTimeout(() => {
          const movedDriverIndex = driverIndex + 1; // Driver moved down one position
          const movedDriverElement = document.querySelector(`[data-story-index="${storyIndex}"][data-persona-index="${personaIndex}"][data-chapter-index="${chapterIndex}"][data-driver-index="${movedDriverIndex}"]`);
          if (movedDriverElement && movedDriverElement.closest('li')) {
            createConfettiBurst(movedDriverElement.closest('li'));
          }
        }, 100);
      }, 250);
    });
  });
}

// GenAI Story Creation Functions
let selectedFile = null;

function initGenAI() {
  const genaiModal = document.getElementById('genaiModal');
  const createWithGenAIBtn = document.getElementById('createWithGenAI');
  const cancelGenAIBtn = document.getElementById('cancelGenAI');
  const processWithGenAIBtn = document.getElementById('processWithGenAI');
  const documentUpload = document.getElementById('documentUpload');
  const uploadArea = document.getElementById('uploadArea');
  const fileInfo = document.getElementById('fileInfo');
  const removeFileBtn = document.querySelector('.remove-file');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const storyNameInput = document.getElementById('storyName');
  const demoScriptInput = document.getElementById('demoScript');

  // Open GenAI modal
  createWithGenAIBtn.addEventListener('click', async () => {
    genaiModal.style.display = 'block';
    await resetGenAIModal();
  });

  // Close GenAI modal
  cancelGenAIBtn.addEventListener('click', closeGenAIModal);
  genaiModal.querySelector('.close').addEventListener('click', closeGenAIModal);
  
  // Close modal when clicking outside
  genaiModal.addEventListener('click', (e) => {
    if (e.target === genaiModal) {
      closeGenAIModal();
    }
  });

  // Tab switching
  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      
      // Update active tab button
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      
      // Update active tab content
      tabContents.forEach(content => content.classList.remove('active'));
      document.getElementById(tab + 'Tab').classList.add('active');
      
      // Reset form when switching tabs
      resetGenAIModal();
    });
  });

  // File upload handling
  documentUpload.addEventListener('change', handleFileUpload);
  
  // Drag and drop handling
  uploadArea.addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent modal close when clicking upload area
    documentUpload.click();
  });
  uploadArea.addEventListener('dragover', (e) => {
    e.stopPropagation();
    handleDragOver(e);
  });
  uploadArea.addEventListener('dragleave', (e) => {
    e.stopPropagation();
    handleDragLeave(e);
  });
  uploadArea.addEventListener('drop', (e) => {
    e.stopPropagation();
    handleDrop(e);
  });
  
  // Choose file button
  document.getElementById('chooseFileBtn').addEventListener('click', (e) => {
    e.stopPropagation(); // Prevent modal close when clicking button
    documentUpload.click();
  });
  
  // Remove file
  removeFileBtn.addEventListener('click', removeFile);
  
  // Form validation
  storyNameInput.addEventListener('input', validateGenAIForm);
  demoScriptInput.addEventListener('input', validateGenAIForm);
  
  // Toggle switch handlers
  document.getElementById('autoGeneratePersonas').addEventListener('change', updateToggleState);
  document.getElementById('autoGenerateChapters').addEventListener('change', updateToggleState);
  
  // Process with GenAI
  processWithGenAIBtn.addEventListener('click', processWithGenAI);
}

async function resetGenAIModal() {
  selectedFile = null;
  document.getElementById('documentUpload').value = '';
  document.getElementById('storyName').value = '';
  document.getElementById('demoScript').value = '';
  document.getElementById('customGuidelines').value = '';
  document.getElementById('fileInfo').style.display = 'none';
  document.getElementById('uploadArea').style.display = 'block';
  document.getElementById('uploadProgress').style.display = 'none';
  document.getElementById('processWithGenAI').disabled = true;
  document.querySelector('.btn-text').style.display = 'inline';
  document.querySelector('.btn-loading').style.display = 'none';
  
  // Update upload limit text from settings
  const fileSizeLimit = await getFileSizeLimit();
  document.getElementById('uploadLimitText').textContent = `Maximum file size: ${fileSizeLimit}KB • PDF files only`;
  
  // Initialize toggle states
  updateToggleState();
  
  // Validate form to set initial button state
  validateGenAIForm();
}

function updateToggleState() {
  const personasToggle = document.getElementById('autoGeneratePersonas');
  const chaptersToggle = document.getElementById('autoGenerateChapters');
  
  const personasItem = personasToggle.closest('.toggle-item');
  const chaptersItem = chaptersToggle.closest('.toggle-item');
  
  if (personasItem) {
    personasItem.classList.toggle('active', personasToggle.checked);
  }
  if (chaptersItem) {
    chaptersItem.classList.toggle('active', chaptersToggle.checked);
  }
}

async function closeGenAIModal() {
  document.getElementById('genaiModal').style.display = 'none';
  await resetGenAIModal();
}

function handleFileUpload(event) {
  const file = event.target.files[0];
  if (file) {
    processSelectedFile(file);
  }
}

function handleDragOver(event) {
  event.preventDefault();
  event.currentTarget.classList.add('dragover');
}

function handleDragLeave(event) {
  event.currentTarget.classList.remove('dragover');
}

function handleDrop(event) {
  event.preventDefault();
  event.currentTarget.classList.remove('dragover');
  
  const files = event.dataTransfer.files;
  if (files.length > 0) {
    const file = files[0];
    if (file.type === 'application/pdf') {
      processSelectedFile(file);
    } else {
      alert('Please upload a PDF file only. DOCX files are not supported for GPT-4 file attachments.');
    }
  }
}

async function processSelectedFile(file) {
  // Check file type - only PDF files are supported
  if (file.type !== 'application/pdf') {
    alert('Only PDF files are supported for GPT-4 file attachments. Please select a PDF file.');
    return;
  }
  
  // Check file size limit from settings
  const maxSizeKB = await getFileSizeLimit();
  const maxSize = maxSizeKB * 1024;
  
  if (file.size > maxSize) {
    alert(`File size exceeds the ${maxSizeKB}KB limit.\n\nSelected file: ${formatFileSize(file.size)}\nMaximum allowed: ${maxSizeKB}KB\n\nPlease choose a smaller file.`);
    return;
  }
  
  selectedFile = file;
  
  // Hide upload area and show file info
  document.getElementById('uploadArea').style.display = 'none';
  document.querySelector('.file-name').textContent = file.name;
  document.querySelector('.file-size').textContent = formatFileSize(file.size);
  document.getElementById('fileInfo').style.display = 'block';
  
  // Add warning if file is close to size limit (within 10% of limit)
  const fileSizeElement = document.querySelector('.file-size');
  const warningThreshold = maxSize * 0.9; // 90% of limit
  if (file.size > warningThreshold) {
    fileSizeElement.style.color = 'var(--warning-color)';
    fileSizeElement.title = `File is close to the ${maxSizeKB}KB limit`;
  } else {
    fileSizeElement.style.color = '';
    fileSizeElement.title = '';
  }
  
  // Don't auto-fill story name from file name - let user enter it explicitly
  // const storyNameInput = document.getElementById('storyName');
  // if (!storyNameInput.value) {
  //   const nameWithoutExt = file.name.replace(/\.[^/.]+$/, "");
  //   storyNameInput.value = nameWithoutExt;
  // }
  
  validateGenAIForm();
}

function removeFile() {
  selectedFile = null;
  document.getElementById('documentUpload').value = '';
  document.getElementById('fileInfo').style.display = 'none';
  document.getElementById('uploadArea').style.display = 'block';
  validateGenAIForm();
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

async function getFileSizeLimit() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['pdfFileSizeLimit'], (result) => {
      resolve(result.pdfFileSizeLimit || 500); // Default to 500KB
    });
  });
}

function validateGenAIForm() {
  const storyName = document.getElementById('storyName').value.trim();
  const demoScript = document.getElementById('demoScript').value.trim();
  const processBtn = document.getElementById('processWithGenAI');
  
  // For upload tab: only require file upload
  // For script tab: require story name and script content
  const uploadTab = document.getElementById('uploadTab');
  const scriptTab = document.getElementById('scriptTab');
  
  let isValid = false;
  
  if (uploadTab.classList.contains('active')) {
    // Upload tab: only need file
    isValid = !!selectedFile;
  } else if (scriptTab.classList.contains('active')) {
    // Script tab: need story name and script
    isValid = storyName && demoScript;
  }
  
  processBtn.disabled = !isValid;
  
  // Debug logging
  console.log('Form validation:', {
    activeTab: uploadTab.classList.contains('active') ? 'upload' : 'script',
    storyName: storyName,
    hasSelectedFile: !!selectedFile,
    demoScriptLength: demoScript.length,
    isValid: isValid,
    buttonDisabled: processBtn.disabled
  });
}

async function processWithGenAI() {
  const storyName = document.getElementById('storyName').value.trim();
  const demoScript = document.getElementById('demoScript').value.trim();
  const customGuidelines = document.getElementById('customGuidelines').value.trim();
  const autoGeneratePersonas = document.getElementById('autoGeneratePersonas').checked;
  const autoGenerateChapters = document.getElementById('autoGenerateChapters').checked;
  
  // Determine which tab is active
  const uploadTab = document.getElementById('uploadTab');
  const scriptTab = document.getElementById('scriptTab');
  
  let finalStoryName = storyName;
  
  if (uploadTab.classList.contains('active')) {
    // For upload tab: use file name as default, let OpenAI generate proper name
    if (selectedFile) {
      const fileName = selectedFile.name.replace(/\.[^/.]+$/, ""); // Remove extension
      finalStoryName = fileName || "Generated Story";
      console.log('Upload tab active - using file name as default:', finalStoryName);
    }
  } else if (scriptTab.classList.contains('active')) {
    // For script tab: use entered story name
    finalStoryName = storyName;
    console.log('Script tab active - using entered story name:', finalStoryName);
  }
  
  const processBtn = document.getElementById('processWithGenAI');
  const btnText = document.querySelector('.btn-text');
  const btnLoading = document.querySelector('.btn-loading');
  
  // Show loading state
  processBtn.disabled = true;
  btnText.style.display = 'none';
  btnLoading.style.display = 'flex';
  
  try {
    let content = '';
    
    console.log('Starting MojoAI processing...');
    console.log('Story name:', finalStoryName);
    console.log('Auto-generate personas:', autoGeneratePersonas);
    console.log('Auto-generate chapters:', autoGenerateChapters);
    
    if (selectedFile) {
      console.log('Processing uploaded file with OpenAI:', selectedFile.name, selectedFile.type);
      // Use OpenAI file upload API
      const fileId = await uploadFileToOpenAI(selectedFile);
      console.log('File uploaded to OpenAI with ID:', fileId);
      
      // Process with OpenAI using the uploaded file
      storyData = await processContentWithGenAI(null, {
        storyName: finalStoryName,
        autoGeneratePersonas,
        autoGenerateChapters,
        customGuidelines,
        uploadedFileId: fileId
      });
    } else {
      console.log('Processing demo script');
      content = demoScript;
      console.log('Script length:', content.length);
      
      // Process with OpenAI using text content
      storyData = await processContentWithGenAI(content, {
        storyName: finalStoryName,
        autoGeneratePersonas,
        autoGenerateChapters,
        customGuidelines
      });
    }
    
    console.log('Story data received from OpenAI:', storyData);
    
    // Save the story
    await saveGenAIStory(storyData);
    
    // Close modal and refresh
    closeGenAIModal();
    render();
    
    // Show success message
    alert(`Story "${storyData.name}" created successfully with MojoAI!\n\nPersonas: ${storyData.personas.length}\nChapters: ${storyData.personas[0]?.chapters?.length || 0}`);
    
  } catch (error) {
    console.error('Error processing with MojoAI:', error);
    
    let errorMessage = 'Error processing content with MojoAI. ';
    
    if (error.message.includes('API key')) {
      errorMessage += 'Please configure your OpenAI API key in Settings > AI Integration.';
    } else if (error.message.includes('No content')) {
      errorMessage += 'Please upload a file or enter a demo script.';
    } else if (error.message.includes('extraction failed')) {
      errorMessage += 'Could not extract text from the uploaded file. Please try the demo script tab instead.';
    } else {
      errorMessage += `Details: ${error.message}`;
    }
    
    alert(errorMessage);
  } finally {
    // Reset button state
    processBtn.disabled = false;
    btnText.style.display = 'inline';
    btnLoading.style.display = 'none';
  }
}

async function uploadFileToOpenAI(file) {
  const settings = await getOpenAISettings();
  
  if (!settings.apiKey) {
    throw new Error('OpenAI API key not configured. Please set it in Settings.');
  }
  
  console.log('Uploading file to OpenAI:', file.name, file.type, file.size);
  
  // Show upload progress
  showUploadProgress('Uploading file...', 0);
  
  // Create FormData for file upload
  const formData = new FormData();
  formData.append('file', file);
  formData.append('purpose', 'assistants'); // Required for file uploads
  console.log('File being uploaded:', file.name, file.type, file.size);
  
  try {
    const response = await fetch('https://api.openai.com/v1/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`
      },
      body: formData
    });
    
    updateUploadProgress('Processing file...', 50);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('OpenAI file upload failed:', response.status, errorData);
      
      if (response.status === 429) {
        throw new Error('OpenAI API quota exceeded. Please check your billing and usage limits.');
      } else if (response.status === 401) {
        throw new Error('Invalid OpenAI API key. Please check your API key in Settings.');
      } else if (response.status === 413) {
        const fileSizeLimit = await getFileSizeLimit();
        throw new Error(`File too large. OpenAI has a 512MB limit for file uploads, but this extension limits files to ${fileSizeLimit}KB for better performance.`);
      } else {
        throw new Error(`File upload failed: ${errorData.error?.message || 'Unknown error'}`);
      }
    }
    
    const uploadResult = await response.json();
    console.log('File uploaded successfully:', uploadResult);
    console.log('Upload result type:', typeof uploadResult);
    console.log('File ID from upload:', uploadResult.id);
    console.log('File ID type:', typeof uploadResult.id);
    
    updateUploadProgress('Waiting for processing...', 75);
    
    // Wait for file to be processed
    await waitForFileProcessing(settings.apiKey, uploadResult.id);
    
    hideUploadProgress();
    
    return uploadResult.id;
    
  } catch (error) {
    hideUploadProgress();
    console.error('File upload error:', error);
    if (error.message.includes('quota') || error.message.includes('billing')) {
      throw error; // Re-throw quota errors as-is
    } else {
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }
}

function showUploadProgress(text, progress) {
  const progressDiv = document.getElementById('uploadProgress');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  progressDiv.style.display = 'block';
  progressFill.style.width = `${progress}%`;
  progressText.textContent = text;
}

function updateUploadProgress(text, progress) {
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  
  progressFill.style.width = `${progress}%`;
  progressText.textContent = text;
}

function hideUploadProgress() {
  const progressDiv = document.getElementById('uploadProgress');
  progressDiv.style.display = 'none';
}

async function waitForFileProcessing(apiKey, fileId, maxWaitTime = 60000) {
  const startTime = Date.now();
  const pollInterval = 2000; // Poll every 2 seconds
  
  console.log('Waiting for file processing...');
  
  while (Date.now() - startTime < maxWaitTime) {
    try {
      const response = await fetch(`https://api.openai.com/v1/files/${fileId}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`Failed to check file status: ${response.status}`);
      }
      
      const fileInfo = await response.json();
      console.log('File status:', fileInfo.status);
      
      if (fileInfo.status === 'processed') {
        console.log('File processing completed');
        return;
      } else if (fileInfo.status === 'error') {
        throw new Error('File processing failed');
      }
      
      // Wait before next poll
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      
    } catch (error) {
      console.error('Error checking file status:', error);
      throw new Error(`File processing check failed: ${error.message}`);
    }
  }
  
  throw new Error('File processing timeout - file took too long to process');
}

async function extractTextFromFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = async (e) => {
      try {
        let text = '';
        
        if (file.type === 'application/pdf') {
          // For PDF files, we'll extract text using a simple approach
          // This is a basic implementation - for production, consider using PDF.js or similar
          text = await extractTextFromPDF(e.target.result);
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // For DOCX files, we'll extract text using a simple approach
          text = await extractTextFromDOCX(e.target.result);
        } else {
          // For plain text files
          text = e.target.result;
        }
        
        if (!text || text.trim().length === 0) {
          throw new Error('No text content found in the file');
        }
        
        resolve(text);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    
    // Read as ArrayBuffer for binary files (PDF, DOCX) or as text for plain text
    if (file.type === 'application/pdf' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      reader.readAsArrayBuffer(file);
    } else {
      reader.readAsText(file);
    }
  });
}

async function extractTextFromPDF(arrayBuffer) {
  // Basic PDF text extraction using PDF.js approach
  // This is a simplified implementation - in production, you'd want to use PDF.js library
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    // Extract text between BT (Begin Text) and ET (End Text) markers
    const textMatches = text.match(/BT[\s\S]*?ET/g);
    if (textMatches) {
      let extractedText = '';
      textMatches.forEach(match => {
        // Extract text content from PDF text objects
        const textContent = match.match(/\([^)]*\)/g);
        if (textContent) {
          textContent.forEach(content => {
            const cleanText = content.replace(/[()]/g, '').trim();
            if (cleanText) {
              extractedText += cleanText + ' ';
            }
          });
        }
      });
      return extractedText.trim();
    }
    
    // Fallback: try to extract readable text patterns
    const readableText = text.match(/[a-zA-Z0-9\s.,!?;:'"()-]{10,}/g);
    if (readableText) {
      return readableText.join(' ').trim();
    }
    
    throw new Error('Could not extract readable text from PDF');
  } catch (error) {
    throw new Error('PDF text extraction failed: ' + error.message);
  }
}

async function extractTextFromDOCX(arrayBuffer) {
  // Basic DOCX text extraction
  // This is a simplified implementation - in production, you'd want to use a proper DOCX parser
  try {
    const uint8Array = new Uint8Array(arrayBuffer);
    
    // DOCX files are ZIP archives containing XML files
    // We'll try to extract text from the main document XML
    const text = new TextDecoder('utf-8', { fatal: false }).decode(uint8Array);
    
    // Look for text content in XML structure
    const textMatches = text.match(/<w:t[^>]*>([^<]*)<\/w:t>/g);
    if (textMatches) {
      let extractedText = '';
      textMatches.forEach(match => {
        const content = match.replace(/<[^>]*>/g, '').trim();
        if (content) {
          extractedText += content + ' ';
        }
      });
      return extractedText.trim();
    }
    
    // Fallback: try to extract readable text patterns
    const readableText = text.match(/[a-zA-Z0-9\s.,!?;:'"()-]{10,}/g);
    if (readableText) {
      return readableText.join(' ').trim();
    }
    
    throw new Error('Could not extract readable text from DOCX');
  } catch (error) {
    throw new Error('DOCX text extraction failed: ' + error.message);
  }
}

async function processContentWithGenAI(content, options) {
  // Get OpenAI settings from storage
  const settings = await getOpenAISettings();
  
  console.log('OpenAI settings:', { 
    hasApiKey: !!settings.apiKey, 
    model: settings.model, 
    maxTokens: settings.maxTokens 
  });
  
  console.log('Model being used for file attachment:', settings.model);
  
  if (!settings.apiKey) {
    throw new Error('OpenAI API key not configured. Please set it in Settings > AI Integration.');
  }
  
  try {
    // Create the prompt for OpenAI
    const prompt = createOpenAIPrompt(content, { ...options, defaultGuidelines: settings.defaultGuidelines });
    console.log('Generated prompt length:', prompt.length);
    console.log('Prompt preview:', prompt.substring(0, 500) + '...');
    
    // Prepare messages array
    const messages = [
      {
        role: 'system',
        content: 'You are an expert at analyzing demo scripts and creating structured demo stories with personas and chapters. Always respond with valid JSON.'
      }
    ];
    
    // Add user message with or without file attachment
    if (options.uploadedFileId) {
      console.log('File ID type:', typeof options.uploadedFileId);
      console.log('File ID value:', options.uploadedFileId);
      
      messages.push({
        role: 'user',
        content: [
          {
            type: 'text',
            text: prompt
          },
          {
            type: 'file',
            file: {
              file_id: options.uploadedFileId
            }
          }
        ]
      });
      console.log('Using uploaded file ID:', options.uploadedFileId);
    } else {
      messages.push({
        role: 'user',
        content: prompt
      });
    }
    
    // Call OpenAI API
    console.log('Making OpenAI API request...');
    console.log('Messages being sent:', JSON.stringify(messages, null, 2));
    
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${settings.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: settings.model,
        messages: messages,
        max_tokens: settings.maxTokens,
        temperature: 0.7
      })
    });
    
    console.log('OpenAI API response status:', response.status);
    
    if (!response.ok) {
      const errorData = await response.json();
      console.error('OpenAI API error response:', errorData);
      throw new Error(errorData.error?.message || `OpenAI API request failed with status ${response.status}`);
    }
    
    const data = await response.json();
    console.log('OpenAI API response data:', data);
    
    const aiResponse = data.choices[0]?.message?.content;
    
    if (!aiResponse) {
      throw new Error('No response from OpenAI API');
    }
    
    console.log('AI response:', aiResponse);
    
    // Extract JSON from markdown code blocks if present
    let jsonString = aiResponse.trim();
    
    // Check if response is wrapped in markdown code blocks
    if (jsonString.startsWith('```json') && jsonString.endsWith('```')) {
      // Extract JSON from ```json ... ``` blocks
      jsonString = jsonString.replace(/^```json\s*/, '').replace(/\s*```$/, '');
    } else if (jsonString.startsWith('```') && jsonString.endsWith('```')) {
      // Extract JSON from ``` ... ``` blocks
      jsonString = jsonString.replace(/^```\s*/, '').replace(/\s*```$/, '');
    }
    
    // Additional cleanup - remove any leading/trailing whitespace and newlines
    jsonString = jsonString.trim();
    
    // Parse the AI response
    let storyData;
    try {
      storyData = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.log('Raw AI response:', aiResponse);
      console.log('Extracted JSON string:', jsonString);
      throw new Error('AI response is not valid JSON. Please try again.');
    }
    
    console.log('Parsed story data:', storyData);
    
    // Validate and structure the response
    const validatedData = validateAndStructureStoryData(storyData, options);
    console.log('Validated story data:', validatedData);
    
    return validatedData;
    
  } catch (error) {
    console.error('OpenAI API error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    
    // Show user-friendly error message based on error type
    let errorMessage = `OpenAI API Error: ${error.message}\n\n`;
    
    if (error.message.includes('quota') || error.message.includes('insufficient_quota')) {
      errorMessage += `❌ QUOTA EXCEEDED\n\nYour OpenAI account has run out of credits.\nPlease:\n1. Go to https://platform.openai.com/\n2. Add payment method or increase quota\n3. Check your billing details\n\nFalling back to pattern-based extraction.`;
    } else if (error.message.includes('API key')) {
      errorMessage += `❌ INVALID API KEY\n\nPlease check your API key in Settings > AI Integration.\n\nFalling back to pattern-based extraction.`;
    } else if (error.message.includes('CORS') || error.message.includes('network')) {
      errorMessage += `❌ NETWORK ISSUE\n\nThis might be a CORS or network connectivity issue.\n\nFalling back to pattern-based extraction.`;
    } else {
      errorMessage += `This might be due to:\n- Invalid API key\n- Network connectivity issues\n- CORS restrictions\n\nFalling back to pattern-based extraction.`;
    }
    
    alert(errorMessage);
    
    // Fallback to pattern-based extraction if API fails
    console.log('Falling back to pattern-based extraction');
    return processContentWithPatterns(content, options);
  }
}

function createOpenAIPrompt(content, options) {
  const storyName = options.storyName;
  const customGuidelines = options.customGuidelines;
  const autoGeneratePersonas = options.autoGeneratePersonas;
  const autoGenerateChapters = options.autoGenerateChapters;
  
  let prompt = `Analyze the following demo script and create a structured story for "${storyName}":\n\n`;
  prompt += `Content:\n${content}\n\n`;
  
  prompt += `Please create a JSON response with the following structure:\n`;
  prompt += `{\n`;
  prompt += `  "name": "${storyName}",\n`;
  prompt += `  "personas": [\n`;
  prompt += `    {\n`;
  prompt += `      "name": "Persona Name",\n`;
  prompt += `      "businessTitle": "Job Title",\n`;
  prompt += `      "description": "Brief description of this persona, you can assume the persona based on the demo content if there is none specifically mentioned",\n`;
  prompt += `      "chapters": [\n`;
  prompt += `        {\n`;
  prompt += `          "title": "Chapter Title, which is one section of the demo",\n`;
  prompt += `          "valueDrivers": ["Key value proposition 1", "Key value proposition 2"],\n`;
  prompt += `          "url": null\n`;
  prompt += `        }\n`;
  prompt += `      ]\n`;
  prompt += `    }\n`;
  prompt += `  ]\n`;
  prompt += `}\n\n`;
  
  if (autoGeneratePersonas) {
    prompt += `Extract personas from the content. Look for:\n`;
    prompt += `- Different user types, roles, or buyer personas\n`;
    prompt += `- Job titles, departments, or user segments\n`;
    prompt += `- Different pain points or use cases\n`;
    prompt += `- For the "businessTitle" field, make an educated guess about the business title/role based on the demo content and context\n\n`;
  }
  
  if (autoGenerateChapters) {
    prompt += `Extract chapters from the content. Look for:\n`;
    prompt += `- Different sections, phases, or steps in the demo\n`;
    prompt += `- Feature demonstrations or workflows\n`;
    prompt += `- Value propositions or benefits, assume some form of business impact such as % time saved or cost reduction, etc.\n\n`;
  }
  
  prompt += `Guidelines:\n`;
  
  // Add custom guidelines first (highest priority)
  if (customGuidelines && customGuidelines.trim().length > 0) {
    prompt += `${customGuidelines}\n\n`;
  } else if (options.defaultGuidelines && options.defaultGuidelines.trim().length > 0) {
    prompt += `${options.defaultGuidelines}\n\n`;
  }
  
  // Add standard guidelines
  prompt += `- Create 1-3 personas maximum\n`;
  prompt += `- Create 3-8 chapters maximum\n`;
  prompt += `- Each chapter should have 1-3 value drivers, assume some if not clearly found\n`;
  prompt += `- Use clear, concise titles and descriptions\n`;
  prompt += `- Focus on business value and user benefits\n`;
  prompt += `- For persona titles, infer appropriate business roles (e.g., "Sales Manager", "IT Director", "Operations Lead") based on the demo content\n`;
  prompt += `- IMPORTANT: Use the exact story name "${storyName}" in the "name" field\n`;
  prompt += `- Return only valid JSON, no additional text\n`;
  
  return prompt;
}

function validateAndStructureStoryData(storyData, options) {
  // Ensure we have the basic structure
  if (!storyData.personas || !Array.isArray(storyData.personas)) {
    throw new Error('Invalid story structure from AI');
  }
  
  // Validate and clean personas with their individual chapters
  const personas = storyData.personas.map(persona => {
    const personaChapters = [];
    
    // Process chapters for this specific persona
    if (persona.chapters && Array.isArray(persona.chapters)) {
      persona.chapters.forEach(chapter => {
        personaChapters.push({
          title: chapter.title || 'Untitled Chapter',
          valueDrivers: Array.isArray(chapter.valueDrivers) ? chapter.valueDrivers : ['Generated value driver'],
          url: chapter.url || null
        });
      });
    }
    
    // If no chapters found for this persona, create default ones
    if (personaChapters.length === 0) {
      personaChapters.push(
        {
          title: 'Introduction',
          valueDrivers: ['Welcome and overview'],
          url: null
        },
        {
          title: 'Main Demo',
          valueDrivers: ['Core functionality demonstration'],
          url: null
        },
        {
          title: 'Conclusion',
          valueDrivers: ['Summary and next steps'],
          url: null
        }
      );
    }
    
    return {
      name: persona.name || 'Demo User',
      businessTitle: persona.businessTitle || persona.title || 'Business Professional',
      description: persona.description || 'Generated persona from content',
      chapters: personaChapters
    };
  });
  
  return {
    name: storyData.name || options.storyName,
    personas: personas
  };
}

function processContentWithPatterns(content, options) {
  // Fallback pattern-based processing (original logic)
  const personas = [];
  const chapters = [];
  
  if (options.autoGeneratePersonas) {
    const personaMatches = content.match(/(?:persona|character|role|user|buyer|stakeholder)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi);
    if (personaMatches) {
      personaMatches.forEach((match, index) => {
        const lines = match.split('\n').filter(line => line.trim());
        const name = lines[0]?.replace(/^(persona|character|role|user|buyer|stakeholder):?\s*/i, '') || `Persona ${index + 1}`;
        const title = lines[1] || 'Business Professional';
        const description = lines.slice(2).join(' ').trim() || 'Generated persona from content';
        
        personas.push({
          name: name.trim(),
          title: title.trim(),
          description: description,
          chapters: []
        });
      });
    }
    
    if (personas.length === 0) {
      personas.push({
        name: 'Demo User',
        title: 'Business Professional',
        description: 'Generated persona from content',
        chapters: []
      });
    }
  }
  
  if (options.autoGenerateChapters) {
    const chapterMatches = content.match(/(?:chapter|section|step|phase|part)[\s\S]*?(?=\n\n|\n[A-Z]|$)/gi);
    if (chapterMatches) {
      chapterMatches.forEach((match, index) => {
        const lines = match.split('\n').filter(line => line.trim());
        const title = lines[0]?.replace(/^(chapter|section|step|phase|part):?\s*/i, '') || `Chapter ${index + 1}`;
        const description = lines.slice(1).join(' ').trim() || 'Generated chapter from content';
        
        chapters.push({
          title: title.trim(),
          valueDrivers: [description],
          url: null
        });
      });
    }
    
    if (chapters.length === 0) {
      chapters.push(
        {
          title: 'Introduction',
          valueDrivers: ['Welcome and overview'],
          url: null
        },
        {
          title: 'Main Demo',
          valueDrivers: ['Core functionality demonstration'],
          url: null
        },
        {
          title: 'Conclusion',
          valueDrivers: ['Summary and next steps'],
          url: null
        }
      );
    }
  }
  
  personas.forEach(persona => {
    persona.chapters = [...chapters];
  });
  
  return {
    name: options.storyName,
    personas: personas
  };
}

async function getOpenAISettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(['openaiApiKey', 'openaiModel', 'openaiMaxTokens', 'defaultGuidelines'], (result) => {
      resolve({
        apiKey: result.openaiApiKey || '',
        model: result.openaiModel || 'gpt-4',
        maxTokens: result.openaiMaxTokens || 2000,
        defaultGuidelines: result.defaultGuidelines || ''
      });
    });
  });
}

async function saveGenAIStory(storyData) {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(["stories"], (result) => {
      const stories = result.stories || [];
      
      // Check if story name already exists
      const existingStory = stories.find(s => s.name === storyData.name);
      if (existingStory) {
        const overwrite = confirm(`A story named "${storyData.name}" already exists. Do you want to replace it?`);
        if (!overwrite) {
          reject(new Error('Story name already exists'));
          return;
        }
        
        // Replace existing story
        const index = stories.findIndex(s => s.name === storyData.name);
        stories[index] = storyData;
      } else {
        // Add new story
        stories.push(storyData);
      }
      
      chrome.storage.local.set({ stories }, () => {
        resolve();
        
        // Show donation popup for new story creation with 2-second delay
        if (!existingStory) {
          setTimeout(() => {
            showDonationPopup();
          }, 2000);
        }
      });
    });
  });
}

// Donation popup functions
let donationTimer = null;
let donationTimerInterval = null;

function showDonationPopup() {
  const modal = document.getElementById('donation-modal');
  if (modal) {
    modal.style.display = 'block';
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
    
    // Start auto-close timer (5 seconds)
    startDonationTimer();
  }
}

function hideDonationPopup() {
  const modal = document.getElementById('donation-modal');
  if (modal) {
    modal.style.display = 'none';
    document.body.style.overflow = 'auto'; // Restore scrolling
    
    // Clear any running timers
    clearDonationTimer();
  }
}

function startDonationTimer() {
  let timeLeft = 5; // 5 seconds
  const progressBar = document.getElementById('timer-progress');
  const timerText = document.getElementById('timer-text');
  
  // Update timer display immediately
  updateTimerDisplay(timeLeft, progressBar, timerText);
  
  // Update every 100ms for smooth progress bar
  donationTimerInterval = setInterval(() => {
    timeLeft -= 0.1;
    updateTimerDisplay(timeLeft, progressBar, timerText);
    
    if (timeLeft <= 0) {
      clearDonationTimer();
      hideDonationPopup();
    }
  }, 100);
}

function updateTimerDisplay(timeLeft, progressBar, timerText) {
  const percentage = (timeLeft / 5) * 100;
  progressBar.style.width = percentage + '%';
  
  if (timeLeft > 1) {
    timerText.textContent = `Spellbound in ${Math.ceil(timeLeft)} seconds...`;
  } else {
    timerText.textContent = 'Support demo magicians!';
  }
}

function clearDonationTimer() {
  if (donationTimerInterval) {
    clearInterval(donationTimerInterval);
    donationTimerInterval = null;
  }
  if (donationTimer) {
    clearTimeout(donationTimer);
    donationTimer = null;
  }
}

// Initialize
addEventListeners();
initDarkMode();
initGenAI();
render();