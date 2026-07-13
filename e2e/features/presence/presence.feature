Feature: Live presence on a page
  As a signed-in PageVault user sharing a page
  I want to see who else is viewing it right now
  So that collaboration feels live, like Notion

  Background:
    Given I am signed in as the test user

  Scenario: A collaborator viewing the same page appears as an avatar
    Given I have a page titled "Standup"
    When I open the page "Standup"
    And I create an invite link that can "edit"
    When a second user opens the invite link
    And the second user joins the page
    Then I see 1 other viewer on the page
