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

  Scenario: Insert a callout block
    Given I have a page titled "Tips"
    When I open the page "Tips"
    And I type "/callout" into a new block
    And I choose "Callout" from the slash menu
    Then the last block should be a "callout" block

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

  Scenario: Reorder blocks by dragging
    Given I have a page titled "Agenda"
    When I open the page "Agenda"
    And I add a block with the text "First"
    And I add a block with the text "Second"
    And I drag the block "Second" above the block "First"
    Then the first block should contain "Second"

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
