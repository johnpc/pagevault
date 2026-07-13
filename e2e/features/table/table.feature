Feature: Table (database) blocks
  As a signed-in user
  I want a table block with editable, typed cells, rows and columns
  So that I can keep structured data on a page like a Notion database

  Background:
    Given I am signed in as the test user

  Scenario: Insert a table, fill a cell, add a row, and see it persist
    Given I have a page titled "Inventory"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Apples"
    And I add a table row
    Then the table has a cell containing "Apples"
    And the table has 2 body rows
    When I reopen the page "Inventory"
    Then the table has a cell containing "Apples"
    And the table has 2 body rows

  Scenario: A checkbox column toggles and persists across a reload
    Given I have a page titled "Checklist"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I set table column 2 type to "checkbox"
    And I check the table checkbox in row 1 column 2
    Then the table checkbox in row 1 column 2 is checked
    When I reopen the page "Checklist"
    Then the table checkbox in row 1 column 2 is checked

  Scenario: Sort rows by clicking a column header
    Given I have a page titled "Sortable"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Charlie"
    And I add a table row
    And I fill table cell "2,1" with "Alpha"
    And I sort by table column 1
    Then table column 1 reads "Alpha" then "Charlie"

  Scenario: Filter rows by a column value, then clear the filter
    Given I have a page titled "Filterable"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Apples"
    And I add a table row
    And I fill table cell "2,1" with "Bananas"
    And I filter table column 1 by "Apple"
    Then the table has 1 body rows
    And the table has a cell containing "Apples"
    When I clear the table filter
    Then the table has 2 body rows
