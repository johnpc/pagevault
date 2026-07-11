Feature: Coloring blocks
  As a signed-in user
  I want to give a block a text color or background highlight
  So that my notes have visual emphasis like they do in Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Highlights"

  Scenario: Highlight a block and see the color persist across a reload
    When I open the page "Highlights"
    And I focus the first block
    And I type "Important note"
    And I set the block color to "Yellow background"
    Then the block is tinted "yellow-bg"
    When I reopen the page "Highlights"
    Then the block is tinted "yellow-bg"
