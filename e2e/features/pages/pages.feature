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
