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

  Scenario: A date column stores a picked date and sorts chronologically
    Given I have a page titled "Timeline"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I set table column 2 type to "date"
    And I fill table cell "1,1" with "Later"
    And I set the table date in cell "1,2" to "2026-03-01"
    And I add a table row
    And I fill table cell "2,1" with "Earlier"
    And I set the table date in cell "2,2" to "2025-12-31"
    And I sort by table column 2
    Then table column 1 reads "Earlier" then "Later"
    When I reopen the page "Timeline"
    Then the table has a cell containing "Earlier"

  Scenario: A column summary totals the visible rows
    Given I have a page titled "Budget"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I set table column 2 type to "number"
    And I fill table cell "1,2" with "10"
    And I add a table row
    And I fill table cell "2,2" with "5"
    And I set the summary for table column 2 to "sum"
    Then the table summary for column 2 shows "15"
    When I filter table column 2 by "10"
    Then the table summary for column 2 shows "10"

  Scenario: Hide a column, then restore it from Properties
    Given I have a page titled "Roster"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Ada"
    And I fill table cell "1,2" with "Lead"
    And I hide table column 2
    Then the table shows 1 column
    And the table has a cell containing "Ada"
    When I show table column 2 from properties
    Then the table shows 2 columns
    And the table has a cell containing "Lead"

  Scenario: Reorder columns by dragging a header
    Given I have a page titled "Columns"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "first-col"
    And I fill table cell "1,2" with "second-col"
    And I drag table column 2 before column 1
    Then table row 1 reads "second-col" then "first-col"
    When I reopen the page "Columns"
    Then table row 1 reads "second-col" then "first-col"

  Scenario: A relation column links a row to a page
    Given I have a page titled "Projects DB"
    When I open the page "Projects DB"
    And I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I set table column 2 type to "relation"
    And I link table cell "1,2" to the page "Reading list"
    Then the table has a relation cell showing "Reading list"
    When I reopen the page "Projects DB"
    Then the table has a relation cell showing "Reading list"
