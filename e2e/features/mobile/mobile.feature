Feature: Mobile sidebar drawer
  As a signed-in user on a phone
  I want the sidebar as a slide-over drawer opened by a hamburger
  So that it never squeezes the reading column, yet every action stays reachable

  Scenario: The sidebar is a drawer opened by the hamburger
    Given I am signed in on a phone-sized screen
    Then the sidebar drawer is closed
    When I open the sidebar drawer
    Then I can reach the "New page" action
    And I can reach the "Sign out" action
    And I can reach the "Settings" action

  Scenario: Opening a page from the drawer closes it and shows the editor
    Given I am signed in on a phone-sized screen
    When I open the sidebar drawer
    And I create a page from the drawer
    Then the block editor is shown
    And the sidebar drawer is closed
