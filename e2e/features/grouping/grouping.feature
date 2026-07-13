Feature: Grouped table view
  As a signed-in user
  I want to group a table's rows into collapsible sections by a select column
  So that I can organize a database like a grouped Notion table

  Background:
    Given I am signed in as the test user
    And I have a page titled "Backlog"

  Scenario: Group a table by a select column, collapse a section, and it persists
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Design the API"
    And I fill table cell "1,2" with "Todo"
    And I set table column 2 type to "select"
    And I turn on table grouping
    Then the table group "Todo" is expanded
    When I collapse the table group "Todo"
    Then the table group "Todo" is collapsed
    When I reopen the page "Backlog"
    Then the table group "Todo" is collapsed
