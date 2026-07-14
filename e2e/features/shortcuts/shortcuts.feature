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

  Scenario: Cmd/Ctrl+U wraps the selected text in underline
    When I open the page "Formatting"
    And I add a block with the text "underline me"
    And I select all text in the block
    And I press the underline formatting shortcut
    Then the block renders "underline me" underlined

  Scenario: Cmd/Ctrl+Shift+S wraps the selected text in strikethrough
    When I open the page "Formatting"
    And I add a block with the text "strike me"
    And I select all text in the block
    And I press the strikethrough formatting shortcut
    Then the block renders "strike me" struck through

  Scenario: Cmd/Ctrl+\ hides and shows the sidebar
    When I open the page "Formatting"
    Then the sidebar is visible
    When I press the sidebar-toggle shortcut
    Then the sidebar is hidden
    When I press the sidebar-toggle shortcut
    Then the sidebar is visible
