Feature: Collapsible toggle blocks
  As a signed-in user
  I want a toggle block whose nested content I can fold away
  So that long pages stay tidy like they do in Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Toggles"

  Scenario: Collapse a toggle to hide its nested child, then expand to reveal it
    # Work on the freshly-created page (already the active editor) — not a reopen,
    # so a CI retry gets its own page instead of piling toggles onto the oldest.
    When I type "/toggle" into a new block
    And I choose "Toggle list" from the slash menu
    And I type "Packing list" then Enter
    And I indent the current block
    And I type "Passport"
    Then the document has a "toggle" block containing "Packing list"
    When I collapse the toggle
    Then I should not see a block containing "Passport"
    When I expand the toggle
    Then the document has a "text" block containing "Passport"
