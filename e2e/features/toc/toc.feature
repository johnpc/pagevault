Feature: Table of contents block
  As a signed-in user
  I want a table-of-contents block that lists my headings
  So that I can navigate a long page like in Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Guide"

  Scenario: A table of contents lists the page's headings
    When I open the page "Guide"
    And I add a block with the text "# Getting started"
    And I add a block with the text "## Install"
    And I type "/toc" into a new block
    And I choose "Table of contents" from the slash menu
    Then the table of contents lists "Getting started"
    And the table of contents lists "Install"
