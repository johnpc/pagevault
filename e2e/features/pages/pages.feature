Feature: Pages and blocks
  As a signed-in PageVault user
  I want to create pages and write in blocks
  So that I can organize my notes in a private, self-hosted workspace

  Background:
    Given I am signed in as the test user

  Scenario: Create a page and see it in the sidebar
    When I create a new page titled "Trip planning"
    Then I should see "Trip planning" in the sidebar

  Scenario: Write a block on a page and reopen it
    Given I have a page titled "Meeting notes"
    When I open the page "Meeting notes"
    And I add a block with the text "Discuss Q3 roadmap"
    And I reopen the page "Meeting notes"
    Then I should see a block containing "Discuss Q3 roadmap"

  Scenario: Inline markdown renders as bold when the block is idle
    Given I have a page titled "Formatted"
    When I open the page "Formatted"
    And I add a block with the text "make it **bold**"
    Then the block renders "bold" in bold

  Scenario: Strikethrough markdown renders when the block is idle
    Given I have a page titled "Struck"
    When I open the page "Struck"
    And I add a block with the text "this is ~~gone~~"
    Then the block renders "gone" struck through

  Scenario: Move a page under another via the picker
    Given I have a page titled "Standalone"
    When I open the page "Standalone"
    And I move the page under "Reading list"
    Then the move picker shows "Reading list" as the parent

  Scenario: Insert a callout block
    Given I have a page titled "Tips"
    When I open the page "Tips"
    And I type "/callout" into a new block
    And I choose "Callout" from the slash menu
    Then the last block should be a "callout" block

  Scenario: Change a callout's icon and see it persist
    Given I have a page titled "Warnings"
    When I open the page "Warnings"
    And I type "/callout" into a new block
    And I choose "Callout" from the slash menu
    And I set the callout icon to "⚠️"
    Then the callout shows the icon "⚠️"
    When I reopen the page "Warnings"
    Then the callout shows the icon "⚠️"

  Scenario: Insert an image block from a URL
    Given I have a page titled "Gallery"
    When I open the page "Gallery"
    And I type "/image" into a new block
    And I choose "Image" from the slash menu
    And I enter the image URL "https://example.com/cat.png"
    Then the page shows an image "https://example.com/cat.png"

  Scenario: Add a cover banner to a page
    Given I have a page titled "Cover me"
    When I open the page "Cover me"
    And I set the "Ocean" cover
    Then the page shows a cover banner

  Scenario: Search for a page icon and set it, and it persists
    Given I have a page titled "Rocket plan"
    When I open the page "Rocket plan"
    And I search page icons for "rocket" and pick "🚀"
    Then the page icon is "🚀"
    When I reopen the page "Rocket plan"
    Then the page icon is "🚀"

  Scenario: The page footer shows a word count
    Given I have a page titled "Stats page"
    When I open the page "Stats page"
    And I add a block with the text "one two three four five"
    Then the page footer shows "5 words"

  Scenario: Markdown shortcut converts a block to a bullet
    Given I have a page titled "Shopping"
    When I open the page "Shopping"
    And I add a block with the text "- Milk"
    Then the last block should be a "bullet" block

  Scenario: The ### shortcut makes a sub-subheading (H3)
    Given I have a page titled "Headings"
    When I open the page "Headings"
    And I add a block with the text "### Fine print"
    Then the last block should be a "subsubheading" block

  Scenario: Duplicate a block
    Given I have a page titled "Dupes"
    When I open the page "Dupes"
    And I add a block with the text "repeat me"
    And I duplicate the first block
    Then I should see 2 blocks containing "repeat me"

  Scenario: Duplicate a block with Cmd/Ctrl+D
    Given I have a page titled "KeyDupes"
    When I open the page "KeyDupes"
    And I add a block with the text "clone me"
    And I duplicate the focused block with the keyboard
    Then I should see 2 blocks containing "clone me"

  Scenario: Reorder blocks by dragging
    Given I have a page titled "Agenda"
    When I open the page "Agenda"
    And I add a block with the text "First"
    And I add a block with the text "Second"
    And I drag the block "Second" above the block "First"
    Then the first block should contain "Second"

  Scenario: Move a block up with Cmd/Ctrl+Shift+Up
    Given I have a page titled "KeyMove"
    When I open the page "KeyMove"
    And I add a block with the text "Top"
    And I add a block with the text "Bottom"
    And I move the block "Bottom" up with the keyboard
    Then the first block should contain "Bottom"

  Scenario: Insert a block type with the slash menu
    Given I have a page titled "Notes"
    When I open the page "Notes"
    And I type "/quote" into a new block
    And I choose "Quote" from the slash menu
    Then the last block should be a "quote" block

  Scenario: Quick-find a page by title and open it
    Given I have a page titled "Quarterly budget"
    When I search for "Quarterly budget"
    And I open the search result "Quarterly budget"
    Then I should see the open page titled "Quarterly budget"

  Scenario: Open a search result with the keyboard
    Given I have a page titled "Keyboard nav target"
    When I search for "Keyboard nav target"
    And I press Enter to open the top result
    Then I should see the open page titled "Keyboard nav target"

  Scenario: Create a sub-page nested under its parent
    Given I have a page titled "Projects"
    When I open the page "Projects"
    And I add a sub-page
    And I name the open page "Website redesign"
    Then the breadcrumb for "Website redesign" should include "Projects"
    And I should see "Website redesign" in the sidebar
    When I collapse the sidebar page "Projects"
    Then I should not see "Website redesign" in the sidebar

  Scenario: Move a page to trash and restore it
    Given I have a page titled "Draft memo"
    When I open the page "Draft memo"
    And I move the page to trash
    Then I should not see "Draft memo" in the sidebar
    When I restore "Draft memo" from the trash
    Then I should see "Draft memo" in the sidebar

  Scenario: Favorite a page and see it pinned in the sidebar
    Given I have a page titled "Team wiki"
    When I open the page "Team wiki"
    And I favorite the open page
    Then I should see "Team wiki" in the sidebar favorites

  Scenario: Duplicate a page with its content
    Given I have a page titled "Template"
    When I open the page "Template"
    And I add a block with the text "Reusable content"
    And I duplicate the page
    Then I should see the open page titled "Template (copy)"
    And I should see a block containing "Reusable content"

  Scenario: Export a page as Markdown
    Given I have a page titled "Release notes"
    When I open the page "Release notes"
    And I add a block with the text "Shipped the thing"
    And I export the page as Markdown
    Then the downloaded file is named "release-notes.md"
    And the download contains "# Release notes"
    And the download contains "Shipped the thing"

  Scenario: Toggle a page to full width
    Given I have a page titled "Wide page"
    When I open the page "Wide page"
    And I toggle full width on
    Then the page is full width

  Scenario: Insert a bookmark block and see the link card
    Given I have a page titled "Links"
    When I open the page "Links"
    And I type "/bookmark" into a new block
    And I choose "Bookmark" from the slash menu
    And I enter the bookmark URL "notion.so"
    Then the page shows a bookmark to "notion.so"
    When I reopen the page "Links"
    Then the page shows a bookmark to "notion.so"

  Scenario: A bookmark shows a scraped preview title
    Given I have a page titled "Preview"
    When I open the page "Preview"
    And I type "/bookmark" into a new block
    And I choose "Bookmark" from the slash menu
    And I enter the bookmark URL "https://example.com"
    Then the bookmark card title reads "Example Domain"

  Scenario: Insert a video embed and see the player
    Given I have a page titled "Media"
    When I open the page "Media"
    And I type "/video" into a new block
    And I choose "Video / audio" from the slash menu
    And I enter the embed URL "https://youtu.be/dQw4w9WgXcQ"
    Then the page shows an embedded iframe
    When I reopen the page "Media"
    Then the page shows an embedded iframe

  Scenario: Embed a Spotify track and see its player
    Given I have a page titled "Tunes"
    When I open the page "Tunes"
    And I type "/embed" into a new block
    And I choose "Video / audio" from the slash menu
    And I enter the embed URL "https://open.spotify.com/track/4cOdK2wGLETKBW3PvgPWqT"
    Then the embedded iframe src contains "open.spotify.com/embed/track/4cOdK2wGLETKBW3PvgPWqT"
