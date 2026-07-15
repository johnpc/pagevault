Feature: Accessibility baseline
  As any user, including those using assistive tech
  I want the core screens to meet WCAG AA
  So that the workspace is usable by everyone

  Background:
    Given I am signed in as the test user

  Scenario: The home screen has no accessibility violations
    When I open the home screen
    Then the page has no serious accessibility violations

  Scenario: The page editor has no accessibility violations
    Given I have a page titled "A11y check"
    When I open the page "A11y check"
    And I focus the first block
    And I type "Some content to measure contrast against" then Enter
    Then the page has no serious accessibility violations

  Scenario: Settings has no accessibility violations
    When I open settings
    Then the page has no serious accessibility violations

  Scenario: The shortcut help overlay has no accessibility violations
    When I open the shortcut help
    Then the page has no serious accessibility violations

  Scenario: A table (database) block has no accessibility violations
    Given I have a page titled "A11y table"
    When I open the page "A11y table"
    And I type "/table" into a new block
    And I choose "Table" from the slash menu
    And I fill table cell "1,1" with "Row one"
    Then the page has no serious accessibility violations

  Scenario: The quick-find dialog has no violations and traps focus
    When I open quick find
    Then the page has no serious accessibility violations
    And Tab keeps focus inside the quick-find dialog

  Scenario: The public shared page has no accessibility violations
    Given I have a page titled "A11y shared"
    When I open the page "A11y shared"
    And I add a block with the text "# A shared heading"
    And I add a block with the text "Body text a logged-out reader sees"
    And I enable sharing for the page
    And I sign out
    And I visit the shared link
    Then the page has no serious accessibility violations
