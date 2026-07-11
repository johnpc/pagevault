Feature: Page font style
  As a signed-in PageVault user
  I want to switch a page's typeface
  So that I can style a document the way I do in Notion

  Background:
    Given I am signed in as the test user

  Scenario: Switch a page to the serif font and see it persist
    Given I have a page titled "Typeset"
    When I open the page "Typeset"
    And I set the page font to "Serif"
    Then the page uses the "serif" font
    When I reopen the page "Typeset"
    Then the page uses the "serif" font
