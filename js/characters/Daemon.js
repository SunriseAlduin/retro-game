import Character from "../Character";

export default class Daemon extends Character {
  constructor(level, type) {
    super(level, type);
    this.type = 'daemon';
    this.attack = 17;
    this.defence = 10;

    if(level > 1){
      for(let i = 1; i < level; i++){
        this.lvlUpConstructor();
      }
    }
  }
}