# Extension Reload Required

## ⚠️ Important: Reload the Extension

After making code changes to a Chrome extension, you **must reload the extension** for the changes to take effect.

### How to Reload the Extension

1. **Open Chrome Extensions Page:**
   - Navigate to `chrome://extensions/`
   - OR click the puzzle icon → "Manage Extensions"

2. **Find DemoMojo:**
   - Look for "DemoMojo" in the list

3. **Click the Reload Button:**
   - Click the circular reload icon (🔄) on the DemoMojo card
   - OR toggle the extension off and back on

4. **Verify Reload:**
   - The version number should show v1.2.3
   - Any open tabs will lose their overlay state

5. **Test Again:**
   - Open a new tab or refresh an existing one
   - Apply an overlay
   - Navigate to a different page
   - Overlay should persist

---

## 🔍 Debugging Steps

If overlay still doesn't persist after reloading:

### Step 1: Check Console for Errors
1. Press `F12` to open DevTools
2. Go to Console tab
3. Look for any red error messages
4. Share the error with me

### Step 2: Check Extension Permissions
1. Go to `chrome://extensions/`
2. Click "Details" on DemoMojo
3. Scroll to "Permissions"
4. Should see: "Read and change all your data", "Tab capture"

### Step 3: Test Fresh Install
1. Remove the extension
2. Reload it from the folder
3. Try applying an overlay again

### Step 4: Check Storage
1. With DevTools open (F12)
2. Go to Application tab
3. Click "Storage" → "Local Storage" → Extension ID
4. Check if `overlayState` exists
5. Check if it has all the necessary fields

---

## 🧪 Test Scenario

To verify overlay persistence works:

1. **Apply Overlay:**
   - Open popup
   - Select Story > Persona > Chapter
   - Click "Apply Overlay"
   - Verify overlay appears

2. **Navigate Away:**
   - Click a link on the page
   - OR type a new URL in the address bar
   - OR click browser back/forward buttons

3. **Check Persistence:**
   - ✅ Overlay should still be visible
   - ✅ Same persona and chapter displayed
   - ✅ Position and size preserved

---

## 📋 What Should Work

After extension reload, these features should work:

✅ **Apply overlay** - Shows on page  
✅ **Navigate pages** - Overlay persists  
✅ **Screenshot Mode** - Toggle in popup  
✅ **Capture button** - Appears in overlay when mode enabled  
✅ **Hide during capture** - Overlay temporarily hides  
✅ **Save screenshot** - Saves to chapter  
✅ **View in setup** - Preview appears  

---

## 🚨 If Still Broken

If the overlay still doesn't persist after reloading the extension, there might be a code issue. Please share:

1. **Console errors** (F12 → Console)
2. **What you see** (blank screen? error message?)
3. **Steps you took** (exactly what you clicked)

I'll investigate further and fix any remaining issues!

---

## 💡 Quick Fix

**TL;DR:**
1. Go to `chrome://extensions/`
2. Find "DemoMojo"
3. Click the reload button (🔄)
4. Test again
