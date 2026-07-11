Feature: Multi-column (side-by-side) layouts
  As a signed-in user
  I want a columns block with text side by side
  So that I can lay out a page in columns like Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Layout"

  Scenario: Insert a columns block, fill both columns, and it persists
    When I type "/columns" into a new block
    And I choose "Columns" from the slash menu
    And I fill column 1 with "Left"
    And I fill column 2 with "Right"
    And I add a layout column
    Then the layout has 3 columns
    When I reopen the page "Layout"
    Then column 1 contains "Left"
    And column 2 contains "Right"
    And the layout has 3 columns
