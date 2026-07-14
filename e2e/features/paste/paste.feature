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
