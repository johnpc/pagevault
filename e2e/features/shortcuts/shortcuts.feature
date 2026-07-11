Feature: Keyboard formatting shortcuts
  As a signed-in user
  I want Cmd/Ctrl+B to bold my selection
  So that formatting feels native, like Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Formatting"

  Scenario: Cmd/Ctrl+B wraps the selected text in bold
    When I open the page "Formatting"
    And I add a block with the text "make me bold"
    And I select all text in the block
    And I press the bold shortcut
    Then the block renders "make me bold" in bold
