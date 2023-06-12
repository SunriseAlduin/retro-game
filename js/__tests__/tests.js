import {calcTileType} from "../utils.js"

test('should correctly define type of cell', () => {
    expect(calcTileType(10, 8)).toBe('center');
    expect(calcTileType(31, 8)).toBe('right');
    expect(calcTileType(3, 2)).toBe('bottom-right');
    expect(calcTileType(0, 8)).toBe('top-left');
    expect(calcTileType(7, 8)).toBe('top-right');
    expect(calcTileType(6, 8)).toBe('top');
    expect(calcTileType(8, 8)).toBe('left');
    expect(calcTileType(56, 8)).toBe('bottom-left');
    expect(calcTileType(60, 8)).toBe('bottom');
});

import Character from '../Character.js'; 
import { characterGenerator, generateTeam } from '../generators.js';
import Bowman from '../characters/Bowman.js';
import Daemon from '../characters/Daemon.js';

describe('Character', () => {
  test('throws an error when creating an instance of Character', () => {
    expect(() => new Character(1)).toThrow('Ошибка: Нельзя создавать новые экземпляры класса Character');
  });

  test('does not throw an error when creating instances of inherited classes', () => {
    expect(() => new Bowman(1)).not.toThrow();
    expect(() => new Daemon(1)).not.toThrow();
  });
});

describe('generateTeam', () => {
  test('generates characters with correct level and attributes', () => {
    const team = generateTeam([Bowman, Daemon], 1, 3);
    team.forEach((character) => {
      expect(character.level).toBe(1);
      expect(character.attack).toBeGreaterThanOrEqual(10);
      expect(character.defence).toBeGreaterThanOrEqual(10);
      expect(character.health).toBe(50);
    });
  });

  test('generates characters with specified allowed types', () => {
    const team = generateTeam([Bowman, Daemon], 1, 3);
    team.forEach((character) => {
      expect(character instanceof Bowman || character instanceof Daemon).toBe(true);
    });
  });

  test('generates characters within the specified level range', () => {
    const team = generateTeam([Bowman, Daemon], 2, 3);
    team.forEach((character) => {
      expect(character.level).toBeGreaterThanOrEqual(1);
      expect(character.level).toBeLessThanOrEqual(2);
    });
  });
});

describe('characterGenerator', () => {
  test('generates characters infinitely from the allowed types', () => {
    const generator = characterGenerator([Bowman, Daemon], 1);
    const generatedCharacters = [];
    for (let i = 0; i < 10; i++) {
      generatedCharacters.push(generator.next().value);
    }

    generatedCharacters.forEach((character) => {
      expect(character instanceof Bowman || character instanceof Daemon).toBe(true);
    });
  });
});
