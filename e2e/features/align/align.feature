Feature: Block text alignment
  As a signed-in user
  I want to center or right-align a block
  So that my notes can have visual emphasis like they do in Notion

  Background:
    Given I am signed in as the test user
    And I have a page titled "Aligned"

  Scenario: Center a block and see the alignment persist across a reload
    When I open the page "Aligned"
    And I focus the first block
    And I type "Centered heading"
    And I set the block alignment to "Center"
    Then the block is aligned "center"
    When I reopen the page "Aligned"
    Then the block is aligned "center"
