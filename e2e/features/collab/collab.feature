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

  Scenario: An edit-role collaborator's changes persist
    Given I have a page titled "Editable plan"
    When I open the page "Editable plan"
    And I add a block with the text "Draft"
    And I create an invite link that can "edit"
    When a second user opens the invite link
    And the second user joins the page
    And the second user appends " edited" to the first block
    Then the second user's first block still reads "Draft edited" after reload

  Scenario: A view-role collaborator cannot edit
    Given I have a page titled "Readonly plan"
    When I open the page "Readonly plan"
    And I add a block with the text "Locked"
    And I create an invite link that can "view"
    When a second user opens the invite link
    And the second user joins the page
    And the second user appends " hacked" to the first block
    Then the second user's first block still reads "Locked" after reload
