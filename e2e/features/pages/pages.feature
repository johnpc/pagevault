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
