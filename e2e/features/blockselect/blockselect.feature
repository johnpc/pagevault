Feature: Select and delete multiple blocks with the keyboard
  As a signed-in PageVault user
  I want to select several blocks with Shift+Arrow and delete them at once
  So that editing feels like a standard editor, not one block at a time

  Background:
    Given I am signed in as the test user

  Scenario: Shift+Arrow selects a range of blocks and Backspace deletes them
    Given I have a page titled "Bulk edit"
    When I open the page "Bulk edit"
    And I focus the first block
    And I type "First" then Enter
    And I type "Second" then Enter
    And I type "Third"
    Then the page has 3 blocks
    When I select the last 2 blocks upward
    And I press Backspace to delete the selection
    Then the page has 1 block
