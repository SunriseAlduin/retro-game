import PositionedCharacter from './PositionedCharacter';
import Character from './Character';
import { generateTeam } from './generators';
import Bowman from './characters/Bowman';
import Daemon from './characters/Daemon';
import Magician from './characters/Magician';
import Swordsman from './characters/Swordsman';
import Undead from './characters/Undead';
import Vampire from './characters/Vampire';
import GameState from './GameState';
import GamePlay from './GamePlay';



export default class GameController {
  constructor(gamePlay, stateService) {
    this.gamePlay = gamePlay;
    this.stateService = stateService;
    this.noOneSelected = true;
    this.bench = [];
    this.fieldBlocked = false;
  }

  init() {
    this.drawUi('prairie');
    this.drawTeams();
    this.addListeners();
    this.initGameState();
    this.gamePlay.setCursor('auto');
  }

  addListeners() {
    this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this))
    this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this))
    this.gamePlay.addCellClickListener(this.onCellClick.bind(this))

    if(this.gamePlay.newGameListeners.length === 0){
      this.gamePlay.addNewGameListener(this.buttonNewGame.bind(this))
      this.gamePlay.addSaveGameListener(this.buttonSaveGame.bind(this))
      this.gamePlay.addLoadGameListener(this.buttonLoadGame.bind(this))
    }
  }

  onCellClick(index) {
    // TODO: react to click
    if(this.currentSelected === index) return;

    if(this.playerTeamPositions.includes(index) && this.gameState.step === true) {
      this.gamePlay.selectCell(index);

      if(this.noOneSelected) {
        this.noOneSelected = false;
      } else {
        this.gamePlay.deselectCell(this.currentSelected);
      }

      this.currentSelected = index;

      const hero = this.positionedTeams.find((obj) => {
        if(obj.position === index) return obj;
      })

      this.currentHero = hero;
      this.defineOpportunities(this.currentHero);
    }

    if(
      this.noOneSelected === false &&
      this.currentHero.allowedMove.includes(index)
      ){
        this.move(index);
      }
    
    if(  
      (this.noOneSelected === false) &&
      (this.currentHero.allowedDamage.includes(index)) &&
      !(this.playerTeamPositions.includes(index)) &&
      (this.enemyTeamPositions.includes(index))
      ){
        this.attack(index);
      }
    
    if(!this.gameState.step){
      this.enemyStep();
    }  
  }

  onCellEnter(index) {
    // TODO: react to mouse enter
    const text = this.createHeader(index);

    if(this.teamPositions.includes(index)) {
      this.gamePlay.showCellTooltip(text, index)
    }

    this.chooseCursor(index);
  }

  onCellLeave(index) {
    // TODO: react to mouse leave
    this.gamePlay.hideCellTooltip(index);
    this.deleteCursor(index)
  }

  buttonNewGame(){
    this.bench = [];
    this.fieldBlocked = false;
    this.livelyTeam = [];
    this.enemyTeamPositions = [];
    this.playerTeamPositions = [];
    this.positionedTeams = [];
    this.teamPositions = [];
    this.gamePlay.redrawPositions(this.positionedTeams);
    this.drawUi('prairie');
    this.drawTeams();
    this.gameState.step = true;

    if(this.gamePlay.cellClickListeners.length === 0){
      this.gamePlay.addCellEnterListener(this.onCellEnter.bind(this))
      this.gamePlay.addCellLeaveListener(this.onCellLeave.bind(this))
      this.gamePlay.addCellClickListener(this.onCellClick.bind(this))
    }
  }

  drawUi(theme) {
    this.gamePlay.drawUi(theme);
    this.ui = theme;
  }

  drawTeams(bench) {
    
    const playerPositions = [0, 8, 16, 24, 32, 40, 48, 56, 1, 9, 17, 25, 33, 41, 49, 57];
    const enemyPositions = [6, 14, 22, 30, 38, 46, 54, 62, 7, 15, 23, 31, 39, 47, 55, 63];

    const playerTeam = generateTeam([Bowman, Swordsman, Magician], 2, 3);
    const enemyTeam = generateTeam([Daemon, Undead, Vampire], 2, 3);

    const playerTeamPositions = [];
    const enemyTeamPositions = [];

    const positionedTeams = [];

    for(let i = 0; i < 3; i++){
      let randomPlayerPosition = Math.floor(Math.random() * playerPositions.length);
      let randomEnemyPosition = Math.floor(Math.random() * enemyPositions.length)

      while (playerTeamPositions.includes(playerPositions[randomPlayerPosition])) {
        randomPlayerPosition = Math.floor(Math.random() * playerPositions.length);
      };
      playerTeamPositions.push(playerPositions[randomPlayerPosition]);
    
      while (enemyTeamPositions.includes(enemyPositions[randomEnemyPosition])) {
        randomEnemyPosition = Math.floor(Math.random() * enemyPositions.length);
      };
      enemyTeamPositions.push(enemyPositions[randomEnemyPosition]);
      

      const player = new PositionedCharacter(playerTeam[i], playerTeamPositions[i]);
      const enemy = new PositionedCharacter(enemyTeam[i], enemyTeamPositions[i]);
      positionedTeams.push(player);
      positionedTeams.push(enemy); 
    };
    
    this.enemyTeamPositions = enemyTeamPositions;
    this.playerTeamPositions = playerTeamPositions;
    this.teamPositions = [...playerTeamPositions, ...enemyTeamPositions];
    this.positionedTeams = positionedTeams;

    this.gamePlay.redrawPositions(positionedTeams);
  }

  createHeader(index) {
    const hero = this.positionedTeams.find((obj) => {
      if(obj.position === index) return obj;
    })

    if(hero) {
      const result = `\u{1F396}${hero.character.level} \u{2694}${hero.character.attack} \u{1F6E1}${hero.character.defence} \u{2764}${hero.character.health}`;
      return result;
    }    
  }

  initGameState() {
    const gameState = new GameState();
    gameState.step = true;
    this.gameState = gameState;
  }

  chooseCursor(index) {    
    if(this.playerTeamPositions.includes(index)) {
      this.gamePlay.setCursor('pointer')
    } else {
      this.gamePlay.setCursor('auto')
    }

    if((this.noOneSelected === false) && 
      (this.currentHero.allowedMove.includes(index)) && 
      !(this.enemyTeamPositions.includes(index)))
    {
      this.gamePlay.selectCell(index, 'green');
    }

    if(
      (this.noOneSelected === false) &&
      (this.currentHero.allowedDamage.includes(index)) &&
      !(this.playerTeamPositions.includes(index)) &&
      (this.enemyTeamPositions.includes(index))
    ){
      this.gamePlay.selectCell(index, 'red');
      this.gamePlay.setCursor('crosshair')
    }

    if(
      (this.noOneSelected === false) &&
      !(this.currentHero.allowedDamage.includes(index)) &&
      !(this.currentHero.allowedMove.includes(index)) &&
      !(this.playerTeamPositions.includes(index))
    ){
      this.gamePlay.setCursor('not-allowed')
    };

    if(this.noOneSelected === false &&
      !(this.currentHero.allowedMove.includes(index)) &&
      !(this.enemyTeamPositions.includes(index)) &&
      !(this.playerTeamPositions.includes(index))
      ){
        this.gamePlay.setCursor('not-allowed')
    }
    
  }

  deleteCursor(index) {
    if(!this.noOneSelected){
      if(!(this.playerTeamPositions.includes(index))){
        this.gamePlay.deselectCell(index)
      }
    }
    
  }

  defineOpportunities(hero){
    hero.allowedDamage = [];
    hero.allowedMove = [];
    hero.column = hero.position % 8;
    hero.row = Math.floor(hero.position / 8);

    const directions = [
      [-1, 0], // Влево
      [1, 0],  // Вправо
      [0, -1], // Вверх
      [0, 1],  // Вниз
      [-1, -1], // Вверх-влево
      [-1, 1],  // Вниз-влево
      [1, -1],  // Вверх-вправо
      [1, 1],   // Вниз-вправо
    ];

    if(hero.character.type === 'swordsman'){
      //Вычисление доступных ходов
      for(const [x, y] of directions){
        for(let i = 1; i<=4; i++){
          const nextColumn = hero.column + x * i;
          const nextRow = hero.row + y * i;

          const newPosition = nextRow * 8 + nextColumn;
          if(nextColumn >= 0 && 
            nextColumn < 8 && 
            nextRow >= 0 && 
            nextRow < 8 && 
            !(this.enemyTeamPositions.includes(newPosition)) 
            && !(this.playerTeamPositions.includes(newPosition))){

            hero.allowedMove.push(newPosition);
          }
        }
      }

      // Вычисление радиуса атаки
      const column = hero.column;
      const row = hero.row;
      const radius = 1;

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (dx === 0 && dy === 0) {
            continue; // Пропускаем центральную клетку
          }
      
          const nextColumn = column + dx;
          const nextRow = row + dy;
      
          // Проверка на ограничения поля
          if (nextColumn >= 0 && nextColumn < 8 && nextRow >= 0 && nextRow < 8) {
            const newPosition = nextRow * 8 + nextColumn;
      
            // Проверка на наличие союзника в промежуточной клетке
            let hasAlly = false;
            let i = 1;
            while (true) {
              const intermediateColumn = column + dx * i;
              const intermediateRow = row + dy * i;
      
              if (
                intermediateColumn === nextColumn &&
                intermediateRow === nextRow
              ) {
                break; // Достигнута целевая клетка
              }
      
              const intermediatePosition = intermediateRow * 8 + intermediateColumn;
              if (this.playerTeamPositions.includes(intermediatePosition)) {
                hasAlly = true;
                break;
              }
      
              i++;
            }
      
            if (!hasAlly && !this.playerTeamPositions.includes(newPosition)) {
              hero.allowedDamage.push(newPosition);
            }
          }
        }
      }
    }

    if(hero.character.type === 'bowman'){
      for(const [x, y] of directions){
        for(let i = 1; i<=2; i++){
          const nextColumn = hero.column + x * i;
          const nextRow = hero.row + y * i;

          const newPosition = nextRow * 8 + nextColumn;
          if(nextColumn >= 0 && 
            nextColumn < 8 && nextRow >= 0 
            && nextRow < 8 && 
            !(this.enemyTeamPositions.includes(newPosition)) 
            && !(this.playerTeamPositions.includes(newPosition))){

            hero.allowedMove.push(newPosition);
          }
        }
      }

      // Вычисление радиуса атаки
      const column = hero.column; // Номер колонки
      const row = hero.row; // Номер строки
      const radius = 2; // Радиус атаки

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (dx === 0 && dy === 0) {
            continue; // Пропускаем центральную клетку
          }
      
          const nextColumn = column + dx;
          const nextRow = row + dy;
      
          // Проверка на ограничения поля
          if (nextColumn >= 0 && nextColumn < 8 && nextRow >= 0 && nextRow < 8) {
            const newPosition = nextRow * 8 + nextColumn;
      
            // Проверка на наличие союзника в промежуточной клетке
            let hasAlly = false;
            let i = 1;
            while (true) {
              const intermediateColumn = column + dx * i;
              const intermediateRow = row + dy * i;
      
              if (
                intermediateColumn === nextColumn &&
                intermediateRow === nextRow
              ) {
                break; // Достигнута целевая клетка
              }
      
              const intermediatePosition = intermediateRow * 8 + intermediateColumn;
              if (this.playerTeamPositions.includes(intermediatePosition)) {
                hasAlly = true;
                break;
              }
      
              i++;
            }
      
            if (!hasAlly && !this.playerTeamPositions.includes(newPosition)) {
              hero.allowedDamage.push(newPosition);
            }
          }
        }
      }
    }

    if(hero.character.type === 'magician'){
      for(const [x, y] of directions){
        for(let i = 1; i<=1; i++){
          const nextColumn = hero.column + x * i;
          const nextRow = hero.row + y * i;

          const newPosition = nextRow * 8 + nextColumn;
          if(nextColumn >= 0 && 
            nextColumn < 8 && nextRow >= 0 && 
            nextRow < 8 && 
            !(this.enemyTeamPositions.includes(newPosition)) 
            && !(this.playerTeamPositions.includes(newPosition))){

            hero.allowedMove.push(newPosition);
          }
        }
      }

      // Вычисление радиуса атаки
      const column = hero.column; // Номер колонки
      const row = hero.row; // Номер строки
      const radius = 4; // Радиус атаки

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (dx === 0 && dy === 0) {
            continue; // Пропускаем центральную клетку
          }
      
          const nextColumn = column + dx;
          const nextRow = row + dy;
      
          // Проверка на ограничения поля
          if (nextColumn >= 0 && nextColumn < 8 && nextRow >= 0 && nextRow < 8) {
            const newPosition = nextRow * 8 + nextColumn;
      
            // Проверка на наличие союзника в промежуточной клетке
            let hasAlly = false;
            let i = 1;
            while (true) {
              const intermediateColumn = column + dx * i;
              const intermediateRow = row + dy * i;
      
              if (
                intermediateColumn === nextColumn &&
                intermediateRow === nextRow
              ) {
                break; // Достигнута целевая клетка
              }
      
              const intermediatePosition = intermediateRow * 8 + intermediateColumn;
              if (this.playerTeamPositions.includes(intermediatePosition)) {
                hasAlly = true;
                break;
              }
      
              i++;
            }
      
            if (!hasAlly && !this.playerTeamPositions.includes(newPosition)) {
              hero.allowedDamage.push(newPosition);
            }
          }
        }
      }
    }
  }

  //вычисление возможностей для команды ботов
  defineEnemyOpportunities(hero){
    hero.allowedDamage = [];
    hero.allowedMove = [];
    hero.column = hero.position % 8;
    hero.row = Math.floor(hero.position / 8);

    const directions = [
      [-1, 0], // Влево
      [1, 0],  // Вправо
      [0, -1], // Вверх
      [0, 1],  // Вниз
      [-1, -1], // Вверх-влево
      [-1, 1],  // Вниз-влево
      [1, -1],  // Вверх-вправо
      [1, 1],   // Вниз-вправо
    ];

    if(hero.character.type === 'undead'){
      //Вычисление доступных ходов
      for(const [x, y] of directions){
        for(let i = 1; i<=4; i++){
          const nextColumn = hero.column + x * i;
          const nextRow = hero.row + y * i;

          const newPosition = nextRow * 8 + nextColumn;
          if(nextColumn >= 0 && 
            nextColumn < 8 && 
            nextRow >= 0 && nextRow < 8 && 
            !(this.enemyTeamPositions.includes(newPosition)) && 
            !(this.playerTeamPositions.includes(newPosition))){

            hero.allowedMove.push(newPosition);
          }
        }
      }

      // Вычисление радиуса атаки
      const column = hero.column; // Номер колонки
      const row = hero.row; // Номер строки
      const radius = 1; // Радиус атаки

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (dx === 0 && dy === 0) {
            continue; // Пропускаем центральную клетку
          }
      
          const nextColumn = column + dx;
          const nextRow = row + dy;
      
          // Проверка на ограничения поля
          if (nextColumn >= 0 && nextColumn < 8 && nextRow >= 0 && nextRow < 8) {
            const newPosition = nextRow * 8 + nextColumn;
      
            // Проверка на наличие союзника в промежуточной клетке
            let hasAlly = false;
            let i = 1;
            while (true) {
              const intermediateColumn = column + dx * i;
              const intermediateRow = row + dy * i;
      
              if (
                intermediateColumn === nextColumn &&
                intermediateRow === nextRow
              ) {
                break; // Достигнута целевая клетка
              }
      
              const intermediatePosition = intermediateRow * 8 + intermediateColumn;
              if (this.enemyTeamPositions.includes(intermediatePosition)) {
                hasAlly = true;
                break;
              }
      
              i++;
            }
      
            if (!hasAlly && !this.enemyTeamPositions.includes(newPosition)) {
              hero.allowedDamage.push(newPosition);
            }
          }
        }
      }
    }

    if(hero.character.type === 'vampire'){
      for(const [x, y] of directions){
        for(let i = 1; i<=2; i++){
          const nextColumn = hero.column + x * i;
          const nextRow = hero.row + y * i;

          const newPosition = nextRow * 8 + nextColumn;
          if(nextColumn >= 0 && 
            nextColumn < 8 && nextRow >= 0 
            && nextRow < 8 && 
            !(this.enemyTeamPositions.includes(newPosition)) 
            && !(this.playerTeamPositions.includes(newPosition))){

            hero.allowedMove.push(newPosition);
          }
        }
      }

      // Вычисление радиуса атаки
      const column = hero.column; // Номер колонки
      const row = hero.row; // Номер строки
      const radius = 2; // Радиус атаки

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (dx === 0 && dy === 0) {
            continue; // Пропускаем центральную клетку
          }
      
          const nextColumn = column + dx;
          const nextRow = row + dy;
      
          // Проверка на ограничения поля
          if (nextColumn >= 0 && nextColumn < 8 && nextRow >= 0 && nextRow < 8) {
            const newPosition = nextRow * 8 + nextColumn;
      
            // Проверка на наличие союзника в промежуточной клетке
            let hasAlly = false;
            let i = 1;
            while (true) {
              const intermediateColumn = column + dx * i;
              const intermediateRow = row + dy * i;
      
              if (
                intermediateColumn === nextColumn &&
                intermediateRow === nextRow
              ) {
                break; // Достигнута целевая клетка
              }
      
              const intermediatePosition = intermediateRow * 8 + intermediateColumn;
              if (this.enemyTeamPositions.includes(intermediatePosition)) {
                hasAlly = true;
                break;
              }
      
              i++;
            }
      
            if (!hasAlly && !this.enemyTeamPositions.includes(newPosition)) {
              hero.allowedDamage.push(newPosition);
            }
          }
        }
      }
    }

    if(hero.character.type === 'daemon'){
      for(const [x, y] of directions){
        for(let i = 1; i<=1; i++){
          const nextColumn = hero.column + x * i;
          const nextRow = hero.row + y * i;

          const newPosition = nextRow * 8 + nextColumn;
          if(nextColumn >= 0 && nextColumn < 8 
            && nextRow >= 0 && nextRow < 8 && 
            !(this.enemyTeamPositions.includes(newPosition)) 
            && !(this.playerTeamPositions.includes(newPosition))){

            hero.allowedMove.push(newPosition);
          }
        }
      }

      // Вычисление радиуса атаки
      const column = hero.column; // Номер колонки
      const row = hero.row; // Номер строки
      const radius = 4; // Радиус атаки

      for (let dx = -radius; dx <= radius; dx++) {
        for (let dy = -radius; dy <= radius; dy++) {
          if (dx === 0 && dy === 0) {
            continue; // Пропускаем центральную клетку
          }
      
          const nextColumn = column + dx;
          const nextRow = row + dy;
      
          // Проверка на ограничения поля
          if (nextColumn >= 0 && nextColumn < 8 && nextRow >= 0 && nextRow < 8) {
            const newPosition = nextRow * 8 + nextColumn;
      
            // Проверка на наличие союзника в промежуточной клетке
            let hasAlly = false;
            let i = 1;
            while (true) {
              const intermediateColumn = column + dx * i;
              const intermediateRow = row + dy * i;
      
              if (
                intermediateColumn === nextColumn &&
                intermediateRow === nextRow
              ) {
                break; // Достигнута целевая клетка
              }
      
              const intermediatePosition = intermediateRow * 8 + intermediateColumn;
              if (this.enemyTeamPositions.includes(intermediatePosition)) {
                hasAlly = true;
                break;
              }
      
              i++;
            }
      
            if (!hasAlly && !this.enemyTeamPositions.includes(newPosition)) {
              hero.allowedDamage.push(newPosition);
            }
          }
        }
      }
    }
  }

  move(index){
    if(this.gameState.step === false) {
      return;
    }
    const element = this.currentHero.position;
    const indexDelete =  this.teamPositions.indexOf(element);

    this.currentHero.position = index;
    this.currentSelected = index;
    this.teamPositions.splice(indexDelete, 1, index);

    if(this.currentHero.character.type === 'bowman' || 
      this.currentHero.character.type === 'swordsman' ||
      this.currentHero.character.type === 'magician'
    ){
      const indexDelete = this.playerTeamPositions.indexOf(element)
      this.playerTeamPositions.splice(indexDelete, 1, index); 
    } else {
      const indexDelete = this.enemyTeamPositions.indexOf(element);
      this.enemyTeamPositions.splice(indexDelete, 1, index);   
    };

    this.gamePlay.deselectCell(element);
    this.gamePlay.redrawPositions(this.positionedTeams);
    this.gamePlay.deselectCell(this.currentHero.position);
    this.currentHero = null;
    this.currentSelected = null;
    this.noOneSelected = true; 
    
    this.gameState.step = !this.gameState.step;
  }

  moveEnemy(index){
    const element = this.currentHero.position;
    const indexDelete =  this.teamPositions.indexOf(element);

    this.currentHero.position = index;
    this.currentSelected = index;
    this.teamPositions.splice(indexDelete, 1, index);

    if(this.currentHero.character.type === 'daemon' || 
      this.currentHero.character.type === 'undead' ||
      this.currentHero.character.type === 'vampire'
    ){
      const indexDelete = this.enemyTeamPositions.indexOf(element)
      this.enemyTeamPositions.splice(indexDelete, 1, index); 
    };

    this.gamePlay.deselectCell(element);
    this.gamePlay.redrawPositions(this.positionedTeams);
    this.currentHero = null;
    this.currentSelected = null;
    this.noOneSelected = true; 
    
    this.gameState.step = !this.gameState.step;
  }

  attack(index){
    const attack = this.currentHero.character.attack;
    const enemy = this.positionedTeams.find((obj) => {
      return obj.position === index;
    });
    const enemyDefence = enemy.character.defence;
    const damage = Math.max(attack - enemyDefence, attack * 0.1);

    const damagePromise = this.gamePlay.showDamage(index, damage);

    damagePromise.then((value) => {
      enemy.character.health = enemy.character.health - damage;
      if(enemy.character.health <= 0){
        this.deathEnemy(enemy);
      }

      this.gamePlay.redrawPositions(this.positionedTeams);
      this.gamePlay.deselectCell(this.currentHero.position);
      this.gamePlay.deselectCell(index);
      this.currentHero = null;
      this.noOneSelected = true;
      this.currentSelected = null;
      this.gameState.step = !this.gameState.step;
      this.deselectAllCells()
      this.enemyStep();
    })
  }

  attackEnemy(index){
    const attack = this.currentHero.character.attack;
    const enemy = this.positionedTeams.find((obj) => {
      return obj.position === index;
    });
    const enemyDefence = enemy.character.defence;
    const damage = Math.max(attack - enemyDefence, attack * 0.1);

    const damagePromise = this.gamePlay.showDamage(index, damage);

    damagePromise.then((value) => {
      enemy.character.health = enemy.character.health - damage;
      if(enemy.character.health <= 0){
        this.deathHero(enemy);
      }
      this.gamePlay.redrawPositions(this.positionedTeams);
      this.currentHero = null;
      this.noOneSelected = true;
      this.currentSelected = null;
      this.gameState.step = !this.gameState.step;
    })
  }

  enemyStep(){
    //Выбор случайного героя
    const randomIndex = Math.floor(Math.random() * this.enemyTeamPositions.length)
    const position = this.enemyTeamPositions[randomIndex];
    const hero = this.positionedTeams.find((obj) => {
      return obj.position === position;
    });
    this.defineEnemyOpportunities(hero);
    this.currentHero = hero;
    this.currentSelected = this.currentHero.position;
    

    //Если нет цели для атаки, идём рандомно куда позволяет allowedMove
    //Если есть цель для атаки - атакуем

    const allowedDamage = this.currentHero.allowedDamage;

    const positionForDamage = this.playerTeamPositions.find((playerNumber) => {
      return allowedDamage.includes(playerNumber);
    });

    const target = this.positionedTeams.find((obj) => {
      return obj.position === positionForDamage;
    });

    if(target){
      this.attackEnemy(positionForDamage);
    } else {
      const random = Math.floor(Math.random() * this.currentHero.allowedMove.length)
      const randomIndex = this.currentHero.allowedMove[random];
      this.moveEnemy(randomIndex); 
    }
  }

  deathEnemy(enemy){
    const enemyPosition = enemy.position;

    const indexEnemyTeamPosition = this.enemyTeamPositions.indexOf(enemyPosition);
    this.enemyTeamPositions.splice(indexEnemyTeamPosition, 1);

    const indexTeamPositions = this.teamPositions.indexOf(enemyPosition);
    this.teamPositions.splice(indexTeamPositions, 1);

    const index = this.positionedTeams.indexOf(enemy);
    this.positionedTeams.splice(index, 1); 

    
    if(this.enemyTeamPositions.length === 0){
      this.changeTheme();
      this.livelyTeam = [...this.bench, ...this.positionedTeams];
      const winners = this.positionedTeams;
      this.levelUp(this.livelyTeam);
      if(this.fieldBlocked === false){
        this.newRound();
      }
    }
  }

  deathHero(hero){
    const heroPosition = hero.position;

    this.bench.push(hero);

    const indexPlayerPosition = this.playerTeamPositions.indexOf(heroPosition);
    this.playerTeamPositions.splice(indexPlayerPosition, 1);

    const indexTeamPositions = this.teamPositions.indexOf(heroPosition);
    this.teamPositions.splice(indexTeamPositions, 1);

    const index = this.positionedTeams.indexOf(hero);
    this.positionedTeams.splice(index, 1);

    if(this.playerTeamPositions.length === 0){
      this.blockField();
    }
  }

  changeTheme(){
    if(this.ui === 'prairie'){
      this.drawUi('desert');
    } else if(this.ui === 'desert') {
      this.drawUi('arctic');
    } else if(this.ui === 'arctic') {
      this.drawUi('mountain');
    } else if(this.ui === 'mountain'){
      this.blockField();
    };
  }

  newRound(){
    const playerPositions = [0, 8, 16, 24, 32, 40, 48, 56, 1, 9, 17, 25, 33, 41, 49, 57];
    const enemyPositions = [6, 14, 22, 30, 38, 46, 54, 62, 7, 15, 23, 31, 39, 47, 55, 63];

    const enemyTeam = generateTeam([Daemon, Undead, Vampire], 2, 3);

    const playerTeamPositions = [];
    const enemyTeamPositions = [];

    const positionedTeams = [...this.livelyTeam];

    for(let i = 0; i < 3; i++){
      let randomPlayerPosition = Math.floor(Math.random() * playerPositions.length);
      let randomEnemyPosition = Math.floor(Math.random() * enemyPositions.length)

      while (playerTeamPositions.includes(playerPositions[randomPlayerPosition])) {
        randomPlayerPosition = Math.floor(Math.random() * playerPositions.length);
      };
      playerTeamPositions.push(playerPositions[randomPlayerPosition]);
    
      while (enemyTeamPositions.includes(enemyPositions[randomEnemyPosition])) {
        randomEnemyPosition = Math.floor(Math.random() * enemyPositions.length);
      };
      enemyTeamPositions.push(enemyPositions[randomEnemyPosition]);
      
      positionedTeams[i].position = playerTeamPositions[i];
      const enemy = new PositionedCharacter(enemyTeam[i], enemyTeamPositions[i]);
      positionedTeams.push(enemy); 
    };
    
    this.enemyTeamPositions = enemyTeamPositions;
    this.playerTeamPositions = playerTeamPositions;
    this.teamPositions = [...playerTeamPositions, ...enemyTeamPositions];
    this.positionedTeams = positionedTeams;

    this.gamePlay.redrawPositions(positionedTeams);

    this.deselectAllCells();
  }

  blockField(){
    this.fieldBlocked = true;

    this.gamePlay.cellClickListeners.pop();
    this.gamePlay.cellEnterListeners.pop();
    this.gamePlay.cellLeaveListeners.pop();

    this.gamePlay.setCursor('auto');
  }

  deselectAllCells(){
    for(let i = 0; i < 64; i++){
      this.gamePlay.deselectCell(i);
    };
  }

  levelUp(winners){
    winners.forEach((char) => {
      if(this.saveLoaded === true){
        this.UpLvl(char.character);
      } else{
        char.character.lvlUp();
      }


      if((char.character.health + 80) > 100){
        char.character.health = 100;
      } else if((char.character.health) + 80 < 1) {
        char.char.health = 1;
      } else {
        char.character.health = char.character.health + 80;
      }
    })
  }
  
  buttonSaveGame(){
    this.stateService.save(this)
  }

  buttonLoadGame(){
    this.saveLoaded = true;
    const load = this.stateService.load();
    this.bench = load.bench;
    this.currentHero = load.currentHero;
    this.currentSelected = load.currentSelected;
    this.enemyTeamPositions = load.enemyTeamPositions;
    this.fieldBlocked = load.fieldBlocked;
    this.gameState = load.gameState;
    this.livelyTeam = load.livelyTeam;
    this.noOneSelected = load.noOneSelected;
    this.playerTeamPositions = load.playerTeamPositions;
    this.positionedTeams = JSON.parse(JSON.stringify(load.positionedTeams));
    this.teamPositions = load.teamPositions;
    this.ui = load.ui;

 
    this.drawUi(this.ui);
    this.gamePlay.redrawPositions(this.positionedTeams);
  }

  UpLvl(hero){
    const attackAfter = Math.max(hero.attack, hero.attack * (80 + hero.health) / 100);
    const defenceAfter = Math.max(hero.defence, hero.defence * (80 + hero.health) / 100);

    hero.attack = Math.round(attackAfter);
    hero.defence = Math.round(defenceAfter);

    hero.level = hero.level + 1;
  }
}
