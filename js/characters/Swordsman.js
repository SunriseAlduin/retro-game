import Character from "../Character";

export default class Swordsman extends Character {
  constructor(level, type) {
    super(level, type);
    this.type = 'swordsman';
    this.attack = 40;
    this.defence = 10;

    if(level > 1){
      for(let i = 1; i < level; i++){
        this.lvlUpConstructor();
      }
    }
  }
}