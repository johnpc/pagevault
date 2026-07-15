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

  Scenario: Undo restores blocks deleted from a selection
    Given I have a page titled "Undo delete"
    When I open the page "Undo delete"
    And I focus the first block
    And I type "Keep" then Enter
    And I type "Gone one" then Enter
    And I type "Gone two"
    Then the page has 3 blocks
    When I select the last 2 blocks upward
    And I press Backspace to delete the selection
    Then the page has 1 block
    When I click Undo on the toast
    Then the page has 3 blocks
    And I should see "Gone two" in a block

  Scenario: Tab indents a whole block selection
    Given I have a page titled "Indent many"
    When I open the page "Indent many"
    And I focus the first block
    And I type "Parent" then Enter
    And I type "Child A" then Enter
    And I type "Child B"
    Then the page has 3 blocks
    When I click into block 2
    And I shift-click block 3
    And I press Tab to indent the selection
    Then blocks 2 and 3 are indented

  Scenario: The duplicate shortcut copies a whole block selection
    Given I have a page titled "Duplicate many"
    When I open the page "Duplicate many"
    And I focus the first block
    And I type "One" then Enter
    And I type "Two" then Enter
    And I type "Three"
    Then the page has 3 blocks
    When I click into block 2
    And I shift-click block 3
    And I press the duplicate shortcut on the selection
    Then the page has 5 blocks

  Scenario: Duplicate a whole block selection from the selection bar
    Given I have a page titled "Dup from bar"
    When I open the page "Dup from bar"
    And I focus the first block
    And I type "One" then Enter
    And I type "Two" then Enter
    And I type "Three"
    Then the page has 3 blocks
    When I click into block 2
    And I shift-click block 3
    And I duplicate the selection from the selection bar
    Then the page has 5 blocks

  Scenario: Turn a whole block selection into headings from the selection bar
    Given I have a page titled "Turn many"
    When I open the page "Turn many"
    And I focus the first block
    And I type "One" then Enter
    And I type "Two" then Enter
    And I type "Three"
    Then the page has 3 blocks
    When I click into block 2
    And I shift-click block 3
    And I turn the selection into "Heading" from the selection bar
    Then blocks 2 and 3 are "heading" blocks

  Scenario: Color a whole block selection from the selection bar
    Given I have a page titled "Color many"
    When I open the page "Color many"
    And I focus the first block
    And I type "One" then Enter
    And I type "Two" then Enter
    And I type "Three"
    Then the page has 3 blocks
    When I click into block 2
    And I shift-click block 3
    And I color the selection "Blue" from the selection bar
    Then blocks 2 and 3 have the "blue" color
