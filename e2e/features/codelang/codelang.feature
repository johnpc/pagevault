Feature: Code block language
  As a signed-in PageVault user
  I want to label a code block with its language
  So that snippets are clearly typed and export with a fenced language

  Background:
    Given I am signed in as the test user

  Scenario: Set a code block's language and see it labelled
    Given I have a page titled "Snippets"
    When I open the page "Snippets"
    And I focus the first block
    And I type "``` "
    And I set the code language to "Python"
    Then the code block is labelled "Python"
    When I reopen the page "Snippets"
    Then the code block is labelled "Python"
