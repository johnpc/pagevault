Feature: Board (kanban) view of a table
  As a signed-in user
  I want to switch a table to a board grouped by a select column
  So that I can organize rows into columns like a Notion board

  Background:
    Given I am signed in as the test user
    And I have a page titled "Sprint"

  Scenario: Switch a table to a board grouped by a select column, and it persists
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Design the API"
    And I fill table cell "1,2" with "Todo"
    And I set table column 2 type to "select"
    And I switch the table to the board view
    Then the board has a column "Todo"
    And the board card reads "Design the API"
    When I reopen the page "Sprint"
    Then the table is in the board view
    And the board card reads "Design the API"
