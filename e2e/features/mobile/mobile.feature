Feature: Mobile sidebar drawer
  As a signed-in user on a phone
  I want the sidebar as a slide-over drawer opened by a hamburger
  So that it never squeezes the reading column, yet every action stays reachable

  Scenario: The sidebar is a drawer opened by the hamburger
    Given I am signed in on a phone-sized screen
    Then the sidebar drawer is closed
    When I open the sidebar drawer
    Then I can reach the "New page" action
    And I can reach the "Sign out" action
    And I can reach the "Settings" action

  Scenario: Opening a page from the drawer closes it and shows the editor
    Given I am signed in on a phone-sized screen
    When I open the sidebar drawer
    And I create a page from the drawer
    Then the block editor is shown
    And the sidebar drawer is closed

  Scenario: Block controls are reachable without hover on a phone
    Given I am signed in on a phone-sized screen
    When I open the sidebar drawer
    And I create a page from the drawer
    And I focus the first block
    And I type "Note"
    Then the block controls are reachable without hovering

  Scenario: Comment edit/delete are reachable without hover on a phone
    Given I am signed in on a phone-sized screen
    When I open the sidebar drawer
    And I create a page from the drawer
    And I add the comment "on my phone"
    Then the page shows the comment "on my phone"
    And the ".pv-comment-edit" control is reachable without hovering
    And the ".pv-comment-del" control is reachable without hovering

  Scenario: Reorder blocks by touch-dragging the handle
    Given I am signed in on a phone-sized screen
    When I open the sidebar drawer
    And I create a page from the drawer
    And I focus the first block
    And I type "First" then Enter
    And I type "Second"
    Then the page has 2 blocks
    When I touch-drag block 1 onto block 2
    Then block 1 contains "Second"
