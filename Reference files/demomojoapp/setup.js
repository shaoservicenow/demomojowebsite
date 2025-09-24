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
}

// Add event listeners for all buttons
function addEventListeners() {
  // Story selector dropdown
  const storySelect = document.getElementById('storySelect');
  if (storySelect) {
    storySelect.addEventListener('change', (e) => {
      selectedStoryIndex = e.target.value;
      render(); // Re-render with new selection
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

// Initialize
addEventListeners();
initDarkMode();
render();