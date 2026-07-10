Feature: Settings
  As a signed-in user
  I want to change the appearance
  So that PageVault matches my preference

  Background:
    Given I am signed in as the test user

  Scenario: Switch to dark theme from settings
    When I open settings
    And I choose the "Dark" theme
    Then the app uses the "dark" theme
