Feature: Live collaborator cursors
  As a signed-in PageVault user sharing a page
  I want to see which block each collaborator is working in
  So that we don't step on each other, like Notion's live cursors

  Background:
    Given I am signed in as the test user

  Scenario: A collaborator focusing a block shows their cursor there
    Given I have a page titled "Cursor demo"
    When I open the page "Cursor demo"
    And I add a block with the text "Shared line"
    And I create an invite link that can "edit"
    When a second user opens the invite link
    And the second user joins the page
    And the second user focuses the first block
    Then I see a collaborator cursor on a block
