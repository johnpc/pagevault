Feature: Page comments
  As a signed-in user
  I want to leave comments on a page
  So that I can annotate my notes, like Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Retro"

  Scenario: Add a comment, see it persist, then delete it
    When I open the page "Retro"
    And I add the comment "ship it on Friday"
    Then the page shows the comment "ship it on Friday"
    When I reopen the page "Retro"
    Then the page shows the comment "ship it on Friday"
    When I delete the comment "ship it on Friday"
    Then the page shows no comment "ship it on Friday"
