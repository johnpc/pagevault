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

  Scenario: Move between table cells with Enter and Shift+Enter
    Given I have a page titled "Grid nav"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I add a table row
    And I focus table cell "1,1"
    And I press Enter in the table
    Then table cell "2,1" is focused
    When I press Shift+Enter in the table
    Then table cell "1,1" is focused

  Scenario: Reorder rows by touch-dragging the row handle
    Given I have a page titled "Row order"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Alpha"
    And I add a table row
    And I fill table cell "2,1" with "Beta"
    Then table cell "1,1" contains "Alpha"
    When I touch-drag table row 1 onto row 2
    Then table cell "1,1" contains "Beta"

  Scenario: Duplicate a row and see the copy persist
    Given I have a page titled "Dupes"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Apples"
    And I duplicate table row 1
    Then the table has 2 body rows
    When I reopen the page "Dupes"
    Then the table has 2 body rows
    And the table has a cell containing "Apples"

  Scenario: Duplicate a column and see the copy persist
    Given I have a page titled "Col dupes"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Apples"
    And I duplicate table column 1
    Then the table shows 3 columns
    And the table row 1 has 2 cells containing "Apples"
    When I reopen the page "Col dupes"
    Then the table shows 3 columns

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

  Scenario: Toggle wrap-text on a column and it persists
    Given I have a page titled "Wrapped"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "a long note"
    And I toggle wrap text on table column 1
    Then table column 1 wraps its text
    When I reopen the page "Wrapped"
    Then table column 1 wraps its text

  Scenario: A multi-select column holds several tags that persist
    Given I have a page titled "Tags"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,2" with "red,blue"
    And I set table column 2 type to "multiselect"
    And I toggle the tag "red" in table cell "1,2"
    Then the multiselect cell "1,2" shows "blue"
    When I reopen the page "Tags"
    Then the multiselect cell "1,2" shows "blue"

  Scenario: A date column displays a friendly medium format
    Given I have a page titled "Dates"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I set table column 2 type to "date"
    And I set the table date in cell "1,2" to "2026-01-05"
    And I set table column 2 format to "medium"
    Then the table has a cell containing "Jan 5, 2026"
    When I reopen the page "Dates"
    Then the table has a cell containing "Jan 5, 2026"

  Scenario: A number column formats its cells as currency
    Given I have a page titled "Prices"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I set table column 2 type to "number"
    And I fill table cell "1,2" with "1000"
    And I set table column 2 format to "usd"
    Then the table has a cell containing "$1,000.00"
    When I reopen the page "Prices"
    Then the table has a cell containing "$1,000.00"

  Scenario: Min, max, and median column summaries
    Given I have a page titled "Stats"
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I set table column 2 type to "number"
    And I fill table cell "1,2" with "3"
    And I add a table row
    And I fill table cell "2,2" with "1"
    And I add a table row
    And I fill table cell "3,2" with "5"
    And I set the summary for table column 2 to "min"
    Then the table summary for column 2 shows "1"
    When I set the summary for table column 2 to "max"
    Then the table summary for column 2 shows "5"
    When I set the summary for table column 2 to "median"
    Then the table summary for column 2 shows "3"

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

  Scenario: Filter a relation column by the linked page's title
    Given I have a page titled "Linked DB"
    When I open the page "Linked DB"
    And I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I set table column 2 type to "relation"
    And I link table cell "1,2" to the page "Reading list"
    And I add a table row
    And I link table cell "2,2" to the page "Welcome to PageVault"
    And I filter table column 2 by "Reading"
    Then the table has 1 body rows
    And the table has a relation cell showing "Reading list"

  Scenario: Two filter conditions narrow rows with AND
    Given I have a page titled "AND filter"
    When I open the page "AND filter"
    And I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "apple"
    And I fill table cell "1,2" with "red"
    And I add a table row
    And I fill table cell "2,1" with "apple"
    And I fill table cell "2,2" with "green"
    And I filter table column 1 by "apple"
    Then the table has 2 body rows
    When I add a filter on table column 2 for "red"
    Then the table has 1 body rows
    And the table has a cell containing "red"

  Scenario: Save a filtered view and re-apply it
    Given I have a page titled "Saved views"
    When I open the page "Saved views"
    And I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "keep"
    And I add a table row
    And I fill table cell "2,1" with "drop"
    And I filter table column 1 by "keep"
    Then the table has 1 body rows
    And I save the current table view as "Kept"
    When I clear the table filter
    Then the table has 2 body rows
    When I apply the saved table view "Kept"
    Then the table has 1 body rows

  Scenario: OR mode shows rows matching any condition
    Given I have a page titled "OR filter"
    When I open the page "OR filter"
    And I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "apple"
    And I add a table row
    And I fill table cell "2,1" with "banana"
    And I add a table row
    And I fill table cell "3,1" with "cherry"
    And I filter table column 1 by "apple"
    And I add a filter on table column 1 for "banana"
    And I set the filter match mode to "any"
    Then the table has 2 body rows
