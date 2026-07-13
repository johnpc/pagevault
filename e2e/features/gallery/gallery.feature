Feature: Gallery view of a table
  As a signed-in user
  I want to switch a table to a gallery of cards
  So that I can browse rows as cards like a Notion gallery

  Background:
    Given I am signed in as the test user
    And I have a page titled "Roster"

  Scenario: Switch a table to the gallery view, and it persists across a reload
    When I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Ada Lovelace"
    And I fill table cell "1,2" with "Engineer"
    And I switch the table to the gallery view
    Then the gallery card reads "Ada Lovelace"
    And the gallery card shows field "Notes" with value "Engineer"
    When I reopen the page "Roster"
    Then the table is in the gallery view
    And the gallery card reads "Ada Lovelace"
