Feature: Backlinks (linked references)
  As a signed-in user
  I want to see which pages mention the current one
  So that my pages are connected both ways, like Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Roadmap"
    And I have a page titled "Journal"

  Scenario: Mentioning a page surfaces it as a linked reference on that page
    When I open the page "Journal"
    And I focus the first block
    And I mention the page "Roadmap"
    And I click away from the block
    When I reopen the page "Roadmap"
    Then I see "Journal" under linked references
    When I follow the linked reference "Journal"
    Then I should see the open page titled "Journal"
