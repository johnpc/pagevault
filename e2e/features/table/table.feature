Feature: Table (database) blocks
  As a signed-in user
  I want a table block with editable cells, rows and columns
  So that I can keep structured data on a page like a Notion database

  Background:
    Given I am signed in as the test user
    And I have a page titled "Inventory"

  Scenario: Insert a table, fill a cell, add a row, and see it persist
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Apples"
    And I add a table row
    Then the table has a cell containing "Apples"
    And the table has 2 body rows
    When I reopen the page "Inventory"
    Then the table has a cell containing "Apples"
    And the table has 2 body rows
