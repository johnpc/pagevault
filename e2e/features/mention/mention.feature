Feature: Mentioning (linking) pages with @
  As a signed-in user
  I want to type @ and pick a page to link it inline
  So that my pages connect to each other like they do in Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Roadmap"
    And I have a page titled "Journal"

  Scenario: Mention a page in a block, then follow the link
    When I open the page "Journal"
    And I focus the first block
    And I mention the page "Roadmap"
    And I click away from the block
    Then the block shows a mention link to "Roadmap"
    When I click the mention link "Roadmap"
    Then I should see the open page titled "Roadmap"
