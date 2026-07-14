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
