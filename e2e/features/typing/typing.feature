Feature: Typing a full document
  As a signed-in user
  I want to type a whole document with real keystrokes
  So that headings, lists, code, and nesting all work as I type

  Background:
    Given I am signed in as the test user
    And I have a page titled "Trip plan"

  Scenario: Compose a document with headings, lists, code and nesting, then share it
    When I open the page "Trip plan"
    And I focus the first block
    And I type "# Trip to Japan" then Enter
    And I type "Things to pack:" then Enter
    And I type "- Passport" then Enter
    And I type "Chargers" then Enter
    And I indent the current block
    And I type "USB-C cable" then Enter
    And I outdent the current block
    And I type "1. Book flights" then Enter
    And I type "Reserve hotels" then Enter
    And I type "``` "
    And I type "npm run build" then Enter
    And I type "> Remember travel insurance" then Enter
    Then the document has a "heading" block containing "Trip to Japan"
    And the document has a "bullet" block containing "Passport"
    And the document has a "numbered" block containing "Book flights"
    And the document has a "code" block containing "npm run build"
    And the document has a "quote" block containing "travel insurance"
    And the document has an indented block containing "USB-C cable"

  Scenario: Share the typed document via link, readable signed out
    When I open the page "Trip plan"
    And I focus the first block
    And I type "# Shareable notes" then Enter
    And I type "public paragraph" then Enter
    And I enable sharing for the page
    And I sign out
    And I visit the shared link
    Then I should see the shared title "Trip plan"
    And I should see the shared content "public paragraph"
