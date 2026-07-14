Feature: Save-failure feedback
  As a signed-in user
  I want to be told when a change can't be saved
  So that a failed save doesn't silently discard my edit

  Background:
    Given I am signed in as the test user
    And I have a page titled "Flaky"

  Scenario: A failed block save shows a toast instead of silently reverting
    When I open the page "Flaky"
    And I focus the first block
    And I type "Saved fine"
    And the backend starts rejecting block saves
    And I focus the first block
    And I type " and then broke"
    Then I see a "Couldn’t save" toast
