import Character from "../Character";

export default class Bowman extends Character {
  constructor(level, type) {
    super(level, type);
    this.type = 'bowman';
    this.attack = 25;
    this.defence = 25;

    if(level > 1){
      for(let i = 1; i < level; i++){
        this.lvlUpConstructor();
      }
    }
  }
}