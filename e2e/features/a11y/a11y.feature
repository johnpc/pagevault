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
