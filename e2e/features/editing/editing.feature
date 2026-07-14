Feature: Smooth keyboard editing
  As a signed-in user
  I want the keyboard to behave like Notion
  So that the caret flows naturally between and within blocks

  Background:
    Given I am signed in as the test user

  Scenario: Enter in the middle of a line splits it into a block right below
    Given I have a page titled "Split feel"
    When I open the page "Split feel"
    And I focus the first block
    And I type "HelloWorld"
    And I press Enter with the caret after "Hello"
    Then the block below "Hello" contains "World"

  Scenario: Arrow keys move the caret between blocks at the edges
    Given I have a page titled "Arrow nav"
    When I open the page "Arrow nav"
    And I focus the first block
    And I type "Alpha" then Enter
    And I type "Bravo" then Enter
    And I type "Charlie"
    Then the page has 3 blocks
    When I put the caret at the start of the block containing "Charlie"
    And I press ArrowUp in the block
    Then the block containing "Bravo" is focused
    When I put the caret at the end of the block containing "Bravo"
    And I press ArrowDown in the block
    Then the block containing "Charlie" is focused

  Scenario: Backspace at the start of a block merges it into the one above
    Given I have a page titled "Merge feel"
    When I open the page "Merge feel"
    And I focus the first block
    And I type "Hello" then Enter
    And I type "World"
    Then the page has 2 blocks
    When I put the caret at the start of the block containing "World"
    And I press Backspace in the block
    Then the page has 1 block
    And the block containing "HelloWorld" is focused

  Scenario: Delete at the end of a block pulls the next block up
    Given I have a page titled "Forward merge"
    When I open the page "Forward merge"
    And I focus the first block
    And I type "Hello" then Enter
    And I type "World"
    Then the page has 2 blocks
    When I put the caret at the end of the block containing "Hello"
    And I press Delete in the block
    Then the page has 1 block
    And the block containing "HelloWorld" is focused

  Scenario: Enter continues a bulleted list, and an empty item exits the list
    Given I have a page titled "List feel"
    When I open the page "List feel"
    And I focus the first block
    And I type "- Milk" then Enter
    And I type "Eggs" then Enter
    Then the document has a "bullet" block containing "Milk"
    And the document has a "bullet" block containing "Eggs"
    When I press Enter on the empty list item
    Then the document has a "text" block that is empty

  Scenario: Undo and redo a block edit with Cmd/Ctrl+Z
    Given I have a page titled "Undo feel"
    When I open the page "Undo feel"
    And I focus the first block
    And I edit the first block to say "first version"
    And I edit the first block to say "second version"
    And I press undo
    Then the first block eventually says "first version"
    When I press redo
    Then the first block eventually says "second version"
