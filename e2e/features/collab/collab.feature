Feature: Collaborate on a page via an invite link
  As a signed-in PageVault user
  I want to invite another person to my page
  So that we can work in the same workspace, not just a read-only public link

  Background:
    Given I am signed in as the test user

  Scenario: A second user joins a shared page and sees its content
    Given I have a page titled "Team plan"
    When I open the page "Team plan"
    And I add a block with the text "Kickoff on Monday"
    And I create an invite link that can "edit"
    When a second user opens the invite link
    And the second user joins the page
    Then the second user sees a block containing "Kickoff on Monday"
