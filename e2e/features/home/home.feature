Feature: Home
  As a signed-in user
  I want to see my recently edited pages on the home screen
  So that I can jump back into recent work

  Background:
    Given I am signed in as the test user

  Scenario: A newly edited page appears in Recently edited
    Given I have a page titled "Recent work"
    When I open the page "Recent work"
    And I add a block with the text "some progress"
    And I go to the home screen
    Then I should see "Recent work" under recently edited
