Feature: Select and delete multiple blocks
  As a signed-in PageVault user
  I want to select several blocks with Shift+Arrow or Shift+Click and delete them
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

  Scenario: Shift+Click selects a range of blocks, then Backspace deletes them
    Given I have a page titled "Click select"
    When I open the page "Click select"
    And I focus the first block
    And I type "One" then Enter
    And I type "Two" then Enter
    And I type "Three"
    Then the page has 3 blocks
    When I click into block 2
    And I shift-click block 3
    And I press Backspace to delete the selection
    Then the page has 1 block

  Scenario: Select all blocks with Cmd/Ctrl+A, then delete them
    Given I have a page titled "Select all"
    When I open the page "Select all"
    And I focus the first block
    And I type "Alpha" then Enter
    And I type "Beta" then Enter
    And I type "Gamma"
    Then the page has 3 blocks
    When I select all blocks with the select-all shortcut
    And I press Backspace to delete the selection
    Then the page has 0 blocks
