import Character from "../Character";

export default class Undead extends Character {
  constructor(level, type) {
    super(level, type);
    this.type = 'undead';
    this.attack = 40;
    this.defence = 10;
    this.flag = false;

    if(level > 1){
      for(let i = 1; i < level; i++){
        this.lvlUpConstructor();
      }
    }
  }
}