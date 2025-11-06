# Session Notes Feature - Testing Guide

## Prerequisites
1. Reload the extension in Chrome
2. Have at least one story created in the DemoMojo extension

## Test Steps

### Test 1: Access Session Notes
1. Open any webpage
2. Open the DemoMojo popup (click extension icon)
3. Select a Story, Persona, and Chapter
4. Click "Apply Overlay"
5. Press `Ctrl+Shift+O` to open fullscreen view
6. **Expected**: You should see a 📝 button in the top-right corner next to ⌕ and − buttons
7. Click the 📝 button
8. **Expected**: A modal should appear with "Session Notes" as the title and an empty state message

### Test 2: Add Notes
1. With the session notes modal open
2. Type "First test note" in the input field
3. Press Enter
4. **Expected**: Note appears in the list above the input
5. Type "Second test note"
6. Click "Add Note" button
7. **Expected**: Second note appears in the list
8. Try adding an empty note (just press Enter without typing)
9. **Expected**: Nothing happens (empty notes are ignored)

### Test 3: Check/Uncheck Notes
1. With notes in the list
2. Click the checkbox next to "First test note"
3. **Expected**: 
   - Checkbox is checked
   - Note text becomes faded (60% opacity)
   - Note text has strikethrough
4. Click the checkbox again
5. **Expected**: 
   - Checkbox is unchecked
   - Note returns to normal appearance

### Test 4: Delete Notes
1. With notes in the list
2. Hover over any note
3. **Expected**: Delete button (×) highlights on hover
4. Click the × button on "First test note"
5. **Expected**: Note is immediately removed from the list

### Test 5: Close Modal
Test all three methods to close the modal:

**Method 1: X button**
1. Click the × button in the modal header
2. **Expected**: Modal closes smoothly

**Method 2: Click outside**
1. Click the 📝 button to reopen
2. Click anywhere outside the modal (on the darkened overlay)
3. **Expected**: Modal closes

**Method 3: Escape key**
1. Click the 📝 button to reopen
2. Press the Escape key
3. **Expected**: Modal closes

### Test 6: Persistence
1. Add several notes (some checked, some unchecked)
2. Close the modal
3. Minimize the overlay (click − button or press Escape)
4. Reopen the overlay and go to fullscreen view
5. Click the 📝 button
6. **Expected**: All your notes are still there with correct checked states

### Test 7: Different Stories
1. With notes in Story A, close the overlay
2. Open the DemoMojo popup
3. Select a different Story (Story B)
4. Apply overlay and go to fullscreen
5. Open session notes
6. **Expected**: No notes should appear (empty state for Story B)
7. Add some notes to Story B
8. Switch back to Story A
9. **Expected**: Story A notes are still there, separate from Story B

### Test 8: Long Notes
1. Type a very long note (200+ characters)
2. Add the note
3. **Expected**: 
   - Note wraps to multiple lines
   - Delete button remains visible
   - Modal remains scrollable if needed

### Test 9: Many Notes
1. Add 10-15 notes
2. **Expected**: 
   - List becomes scrollable
   - Modal maintains max height (80vh)
   - All functionality continues to work

### Test 10: Special Characters
1. Add notes with special characters:
   - "Test with <script>alert('xss')</script>"
   - "Test with & ampersand & symbols"
   - "Test with 'quotes' and \"double quotes\""
2. **Expected**: 
   - All characters are properly displayed
   - No JavaScript execution (XSS protection)
   - No HTML rendering issues

### Test 11: Keyboard Navigation
1. Open session notes modal
2. Input field should be automatically focused
3. Type a note and press Enter
4. **Expected**: 
   - Note is added
   - Input is cleared
   - Input remains focused for next note
5. Add multiple notes using only keyboard (Tab, Enter, Escape)
6. **Expected**: Smooth keyboard workflow

## Common Issues & Troubleshooting

### Issue: 📝 button doesn't appear
- **Cause**: Not in fullscreen mode
- **Solution**: Press Ctrl+Shift+O to enter fullscreen mode

### Issue: Notes don't save
- **Cause**: Story index not set properly
- **Solution**: Make sure you applied the overlay from the popup (don't just reload page)

### Issue: Modal won't open
- **Cause**: JavaScript error or extension not reloaded
- **Solution**: 
  1. Open Chrome DevTools (F12)
  2. Check Console for errors
  3. Reload the extension
  4. Refresh the page

### Issue: Notes are mixed between stories
- **Cause**: Story index not tracking correctly
- **Solution**: This shouldn't happen - file a bug report if it does

## Success Criteria
✅ All tests pass without errors
✅ Notes persist across sessions
✅ Each story has separate notes
✅ Modal is responsive and smooth
✅ No console errors
✅ XSS protection works
✅ Keyboard shortcuts work
✅ Visual feedback is clear

## Performance Check
- Modal should open in < 100ms
- Adding notes should be instant
- No lag when checking/unchecking
- Smooth animations
- No memory leaks (check DevTools Memory tab)

## Browser Compatibility
Tested on:
- [ ] Chrome (primary)
- [ ] Edge (Chromium)
- [ ] Brave
- [ ] Other Chromium-based browsers

## Notes
- Session notes are stored in `chrome.storage.local`
- Each story object has a `sessionNotes` array
- Notes include: `text`, `checked`, and `timestamp` properties
- Storage is automatically synced when notes change

