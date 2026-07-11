Feature: Turn a block into another type
  As a signed-in PageVault user
  I want to convert an existing block to another type without retyping
  So that I can restructure a page the way I do in Notion

  Background:
    Given I am signed in as the test user

  Scenario: Turn a written paragraph into a heading, keeping its text
    Given I have a page titled "Restructure"
    When I open the page "Restructure"
    And I focus the first block
    And I type "Project overview"
    And I turn the block into a "Heading"
    Then the document has a "heading" block containing "Project overview"

  Scenario: Turn a paragraph into a to-do, keeping its text
    Given I have a page titled "Restructure todos"
    When I open the page "Restructure todos"
    And I focus the first block
    And I type "Ship the release"
    And I turn the block into a "To-do"
    Then the document has a "todo" block containing "Ship the release"
