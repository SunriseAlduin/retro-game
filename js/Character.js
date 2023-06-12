/**
 * Базовый класс, от которого наследуются классы персонажей
 * @property level - уровень персонажа
 * @property attack - показатель атаки
 * @property defence - показатель защиты
 * @property health - здоровье персонажа
 * @property type - строка с одним из допустимых значений:
 * swordsman
 * bowman
 * magician
 * daemon
 * undead
 * vampire
 */
export default class Character {
  constructor(level, type = 'generic') {
    
    if(new.target === Character){
      throw new Error('Ошибка: Нельзя создавать новые экземпляры класса Character');
    };
    
    this.level = level;
    this.attack = 0;
    this.defence = 0;
    this.health = 50;
    this.type = type;

  }


  lvlUpConstructor(){
    const attackAfter = Math.max(this.attack, this.attack * (80 + this.health) / 100);
    const defenceAfter = Math.max(this.defence, this.defence * (80 + this.health) / 100);

    this.attack = Math.round(attackAfter);
    this.defence = Math.round(defenceAfter);
  }

  lvlUp(){
    const attackAfter = Math.max(this.attack, this.attack * (80 + this.health) / 100);
    const defenceAfter = Math.max(this.defence, this.defence * (80 + this.health) / 100);

    this.attack = Math.round(attackAfter);
    this.defence = Math.round(defenceAfter);

    this.level = this.level + 1;
  }
}
