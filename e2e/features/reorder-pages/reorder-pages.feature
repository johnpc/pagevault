Feature: Reordering pages in the sidebar
  As a signed-in user
  I want to drag a page above another in the sidebar
  So that my workspace is ordered the way I think, like Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Alpha"
    And I have a page titled "Bravo"
    And I have a page titled "Charlie"

  Scenario: Drag the last page above the first and see the new order persist
    When I drag the sidebar page "Charlie" above "Alpha"
    Then the sidebar page order starts with "Charlie" then "Alpha"
    When I reload the app
    Then the sidebar page order starts with "Charlie" then "Alpha"

  Scenario: Touch-drag a page above another and see the new order persist
    When I touch-drag the sidebar page "Charlie" above "Alpha"
    Then the sidebar page order starts with "Charlie" then "Alpha"
    When I reload the app
    Then the sidebar page order starts with "Charlie" then "Alpha"
