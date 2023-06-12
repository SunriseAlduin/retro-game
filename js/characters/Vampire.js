import Character from "../Character";

export default class Vampire extends Character {
  constructor(level, type) {
    super(level, type);
    this.type = 'vampire';
    this.attack = 25;
    this.defence = 25;

    if(level > 1){
      for(let i = 1; i < level; i++){
        this.lvlUpConstructor();
      }
    }
  }
}