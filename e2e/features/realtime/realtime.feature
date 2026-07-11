Feature: Live sync across open views
  As a signed-in PageVault user
  I want edits to appear in every open tab without reloading
  So that my workspace stays consistent across devices

  Background:
    Given I am signed in as the test user

  Scenario: A block edit shows up live in another open tab
    Given I have a page titled "Live sync notes"
    And I open the page "Live sync notes" in a second tab
    When I add a block with the text "Realtime is live"
    Then the second tab shows a block containing "Realtime is live" without reloading

  Scenario: A page title change shows up live in another open tab
    Given I have a page titled "Rename me live"
    And I open the page "Rename me live" in a second tab
    When I rename the page to "Renamed live"
    Then the second tab shows "Renamed live" in the sidebar without reloading
