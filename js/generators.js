import Team from './Team';
/**
 * Формирует экземпляр персонажа из массива allowedTypes со
 * случайным уровнем от 1 до maxLevel
 *
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @returns генератор, который при каждом вызове
 * возвращает новый экземпляр класса персонажа
 *
 */
export function* characterGenerator(allowedTypes, maxLevel) {
  const length = allowedTypes.length;

  while(true) {
    const randomIndex = Math.floor(Math.random() * length);
    const randomType = allowedTypes[randomIndex]
    const randomLevel = Math.floor(Math.random() * maxLevel) + 1;
    const character = new randomType(randomLevel);
    
    yield character;
  }  
}

/**
 * Формирует массив персонажей на основе characterGenerator
 * @param allowedTypes массив классов
 * @param maxLevel максимальный возможный уровень персонажа
 * @param characterCount количество персонажей, которое нужно сформировать
 * @returns экземпляр Team, хранящий экземпляры персонажей. Количество персонажей в команде - characterCount
 * */
export function generateTeam(allowedTypes, maxLevel, characterCount) {
  const generator = characterGenerator(allowedTypes, maxLevel);
  const heroes = [];

  for(let i = 0; i < characterCount; i++){
    const hero = generator.next().value;
    heroes.push(hero);
  };

  const team = new Team(heroes);
  return team.characters;
}
