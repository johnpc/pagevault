Feature: Copy button on code blocks
  As a signed-in user
  I want a copy button on code blocks
  So that I can grab a snippet in one click, like Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Snippets"

  Scenario: A code block offers a copy button that copies its contents
    When I open the page "Snippets"
    And I add a block with the text "``` "
    And I type "npm run build" into the code block
    And I click the code copy button
    Then the code copy button reads "Copied!"
    And the clipboard contains "npm run build"
