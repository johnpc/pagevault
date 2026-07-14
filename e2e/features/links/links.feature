Feature: Inline links
  As a signed-in user
  I want [text](url) and bare URLs to become clickable links
  So that my notes link out to the web like they do in Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Links"

  Scenario: A [text](url) markdown link renders as a clickable link
    When I open the page "Links"
    And I add a block with the text "see [the docs](https://example.com) now"
    Then the block shows a link "the docs" to "https://example.com"

  Scenario: A bare URL is autolinked
    When I open the page "Links"
    And I add a block with the text "read https://example.com/guide today"
    Then the block shows a link "https://example.com/guide" to "https://example.com/guide"
