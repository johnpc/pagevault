Feature: Pasting markdown into a document
  As a signed-in user
  I want to paste a chunk of markdown into an empty block
  So that it is converted into the matching blocks automatically

  Background:
    Given I am signed in as the test user
    And I have a page titled "Imported notes"

  Scenario: Paste a markdown document into an empty block
    When I open the page "Imported notes"
    And I focus a fresh empty block
    And I paste the markdown:
      """
      # Meeting notes
      Kickoff summary
      - Ship the beta
      - Gather feedback
      1. Draft the plan
      > Keep it simple
      """
    Then the document has a "heading" block containing "Meeting notes"
    And the document has a "text" block containing "Kickoff summary"
    And the document has a "bullet" block containing "Ship the beta"
    And the document has a "numbered" block containing "Draft the plan"
    And the document has a "quote" block containing "Keep it simple"

  Scenario: Paste a URL over selected text to make a link
    When I open the page "Imported notes"
    And I select all and paste the url "https://example.com" onto "the docs"
    Then the block renders a link "the docs" to "https://example.com"

  Scenario: Pasted blocks land at the paste location, not the page end
    When I open the page "Imported notes"
    And I focus the first block
    And I type "Head line" then Enter
    And I type "Trailing line"
    And I click the "+" gutter button on the block containing "Head line"
    And I paste the markdown into the focused block:
      """
      # Pasted heading
      Pasted body
      """
    Then block 1 contains "Head line"
    And block 2 contains "Pasted heading"
    And block 3 contains "Pasted body"
    And block 4 contains "Trailing line"

  Scenario: Pasting an indented list keeps the nesting
    When I open the page "Imported notes"
    And I focus a fresh empty block
    And I paste the markdown:
      """
      - Groceries
        - Milk
        - Eggs
      """
    Then the document has a "bullet" block containing "Groceries"
    And the document has an indented block containing "Milk"
