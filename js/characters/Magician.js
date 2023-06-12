import Character from "../Character";

export default class Magician extends Character {
  constructor(level, type) {
    super(level, type);
    this.type = 'magician';
    this.attack = 17;
    this.defence = 40;

    if(level > 1){
      for(let i = 1; i < level; i++){
        this.lvlUpConstructor();
      }
    }
  }
}