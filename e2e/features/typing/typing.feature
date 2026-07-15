Feature: Typing a full document
  As a signed-in user
  I want to type a whole document with real keystrokes
  So that headings, lists, code, and nesting all work as I type

  Background:
    Given I am signed in as the test user

  Scenario: Compose a document with headings, lists, code and nesting, then share it
    Given I have a page titled "Trip plan"
    When I open the page "Trip plan"
    And I focus the first block
    And I type "# Trip to Japan" then Enter
    And I type "Things to pack:" then Enter
    And I type "- Passport" then Enter
    And I type "Chargers" then Enter
    And I indent the current block
    And I type "USB-C cable" then Enter
    And I press Enter on the empty list item
    And I press Enter on the empty list item
    And I type "1. Book flights" then Enter
    And I type "Reserve hotels" then Enter
    And I press Enter on the empty list item
    And I type "> Remember travel insurance" then Enter
    And I type "``` "
    And I type "npm run build"
    Then the document has a "heading" block containing "Trip to Japan"
    And the document has a "bullet" block containing "Passport"
    And the document has a "numbered" block containing "Book flights"
    And the document has a "code" block containing "npm run build"
    And the document has a "quote" block containing "travel insurance"
    And the document has an indented block containing "USB-C cable"

  Scenario: Click the empty space below the blocks to start writing
    Given I have a page titled "Scratchpad"
    When I open the page "Scratchpad"
    And I focus the first block
    And I type "First line" then Enter
    And I type "Second line"
    And I click the empty space below the blocks
    Then a new empty block is focused
    When I type "Third line"
    Then the document has a "text" block containing "Third line"

  Scenario: Checking a to-do marks it done (strike-through)
    Given I have a page titled "Chores"
    When I open the page "Chores"
    And I focus the first block
    And I type "[] Buy milk"
    Then the document has a "todo" block containing "Buy milk"
    When I check the first to-do
    Then a to-do block is marked done

  Scenario: Any "N. " prefix (not just "1.") starts a numbered list
    Given I have a page titled "Numbered"
    When I open the page "Numbered"
    And I focus the first block
    And I type "3. Third item" then Enter
    Then the document has a "numbered" block containing "Third item"

  Scenario: Open the slash menu mid-line and convert the block, keeping the text
    Given I have a page titled "Slash mid-line"
    When I open the page "Slash mid-line"
    And I focus the first block
    And I type "Remember this "
    And I type "/quote"
    And I choose "Quote" from the slash menu
    Then the document has a "quote" block containing "Remember this"

  Scenario: Share the typed document via link, readable signed out
    Given I have a page titled "Shared notes"
    When I open the page "Shared notes"
    And I focus the first block
    And I type "# Shareable notes" then Enter
    And I type "public paragraph" then Enter
    And I enable sharing for the page
    And I sign out
    And I visit the shared link
    Then I should see the shared title "Shared notes"
    And I should see the shared content "public paragraph"
