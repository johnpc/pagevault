Feature: Calendar view of a table
  As a signed-in user
  I want to switch a table to a calendar grouped by a date column
  So that I can see rows on a month grid like a Notion calendar

  Background:
    Given I am signed in as the test user
    And I have a page titled "Schedule"

  Scenario: Switch a table to the calendar view, place a row on today, and persist
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Launch review"
    And I set table column 2 type to "date"
    And I fill table cell "1,2" with today's date
    And I switch the table to the calendar view
    Then the calendar shows the event "Launch review"
    When I reopen the page "Schedule"
    Then the table is in the calendar view
    And the calendar shows the event "Launch review"
