Feature: Mentioning (linking) pages with @
  As a signed-in user
  I want to type @ and pick a page to link it inline
  So that my pages connect to each other like they do in Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Mention target"
    And I have a page titled "Mention source"

  Scenario: Mention a page in a block, then follow the link
    When I open the page "Mention source"
    And I focus the first block
    And I mention the page "Mention target"
    And I click away from the block
    Then the block shows a mention link to "Mention target"
    When I click the mention link "Mention target"
    Then I should see the open page titled "Mention target"

  Scenario: Insert today's date with @today
    When I open the page "Mention source"
    And I focus the first block
    And I insert the "today" date mention
    Then the block contains a date like "\w{3} \d{1,2}, \d{4}"
