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

  Scenario: Three backticks alone (no trailing space) make a code block
    Given I have a page titled "Quick code"
    When I open the page "Quick code"
    And I focus the first block
    And I type "```"
    Then the document has a "code" block that is empty

  Scenario: A code block with a language is syntax-highlighted
    Given I have a page titled "Highlighted"
    When I open the page "Highlighted"
    And I focus the first block
    And I type "```"
    And I set the code language to "JavaScript"
    And I type "const answer = 42" into the code block
    Then the code block is syntax-highlighted

  Scenario: Tab inside a code block inserts spaces instead of outdenting
    Given I have a page titled "Indent code"
    When I open the page "Indent code"
    And I focus the first block
    And I type "```"
    And I press Tab in the code block
    Then the code block starts with two spaces
