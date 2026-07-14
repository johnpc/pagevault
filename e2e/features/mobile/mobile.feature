Feature: Mobile sidebar rail
  As a signed-in user on a phone
  I want the sidebar's primary actions to stay reachable in the slim rail
  So that I can still create pages and navigate on a small screen

  Scenario: Primary actions are reachable on a phone-sized screen
    Given I am signed in on a phone-sized screen
    Then I can reach the "New page" action
    And I can reach the "Sign out" action
    And I can reach the "Settings" action

  Scenario: Creating a page works from the phone rail
    Given I am signed in on a phone-sized screen
    When I create a page from the rail
    Then the block editor is shown
