Feature: Smooth Enter-key editing
  As a signed-in user
  I want pressing Enter to behave like Notion
  So that the caret flows naturally instead of jumping to a stray empty block

  Background:
    Given I am signed in as the test user

  Scenario: Enter in the middle of a line splits it into a block right below
    Given I have a page titled "Split feel"
    When I open the page "Split feel"
    And I focus the first block
    And I type "HelloWorld"
    And I press Enter with the caret after "Hello"
    Then the block below "Hello" contains "World"

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
