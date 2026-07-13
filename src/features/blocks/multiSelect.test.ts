import { describe, it, expect } from 'vitest';
import { selectedValues, isSelected, toggleValue } from './multiSelect';

describe('selectedValues', () => {
  it('splits a comma-joined cell, trimming blanks', () => {
    expect(selectedValues('Red,Blue')).toEqual(['Red', 'Blue']);
    expect(selectedValues(' Red , , Blue ')).toEqual(['Red', 'Blue']);
    expect(selectedValues('')).toEqual([]);
  });
});

describe('isSelected', () => {
  it('reports membership', () => {
    expect(isSelected('Red,Blue', 'Red')).toBe(true);
    expect(isSelected('Red,Blue', 'Green')).toBe(false);
  });
});

describe('toggleValue', () => {
  const order = ['Red', 'Green', 'Blue'];

  it('adds an option in the column option order', () => {
    expect(toggleValue('Blue', 'Red', order)).toBe('Red,Blue');
    expect(toggleValue('', 'Green', order)).toBe('Green');
  });

  it('removes an already-selected option', () => {
    expect(toggleValue('Red,Blue', 'Red', order)).toBe('Blue');
    expect(toggleValue('Green', 'Green', order)).toBe('');
  });

  it('keeps the result ordered by the column options', () => {
    expect(toggleValue('Blue,Red', 'Green', order)).toBe('Red,Green,Blue');
  });
});
