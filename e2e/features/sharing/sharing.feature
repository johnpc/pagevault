Feature: Public link sharing
  As a signed-in user
  I want to share a page by link
  So that anyone with the URL can read it without an account

  Scenario: Share a page and open it while signed out
    Given I am signed in as the test user
    And I have a page titled "Shared roadmap"
    When I open the page "Shared roadmap"
    And I add a block with the text "Q3 goals"
    And I enable sharing for the page
    And I sign out
    And I visit the shared link
    Then I should see the shared title "Shared roadmap"
    And I should see the shared content "Q3 goals"

  Scenario: A shared code block renders preformatted, not as inline markdown
    Given I am signed in as the test user
    And I have a page titled "Shared snippet"
    When I open the page "Shared snippet"
    And I type "```" into a new block
    And I type "const x = **not bold**" into the code block
    And I enable sharing for the page
    And I sign out
    And I visit the shared link
    Then the shared page shows a code block containing "const x = **not bold**"

  Scenario: An invalid or revoked share link shows a clear "not shared" message
    When I visit a made-up share link
    Then I should see the "not shared" message
    And I should not see a connection error
