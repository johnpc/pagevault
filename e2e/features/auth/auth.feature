Feature: Account access
  As a new visitor
  I want to create an account and sign in
  So that my notes stay private to me

  Scenario: The workspace requires signing in
    Given I open PageVault while signed out
    Then I should see the sign-in screen

  Scenario: Sign in and reach my workspace
    Given I am signed in as the test user
    Then I should see my workspace
