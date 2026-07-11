Feature: Keyboard shortcut help
  As a signed-in user
  I want a shortcut reference
  So that I can discover how to work faster

  Background:
    Given I am signed in as the test user

  Scenario: Open the shortcut help from the sidebar
    When I open the shortcut help
    Then I should see the quick-find shortcut listed
