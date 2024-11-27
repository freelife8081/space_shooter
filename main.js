/*-----------ONLOAD INITIALIZATION-----------*/
window.onload = function () {
  const canvasElement = document.querySelector("canvas");
  canvasElement.width = innerWidth;
  canvasElement.height = innerHeight;
  const c = canvasElement.getContext("2d");

  /*-----------MOUSE/TOUCH & CONTROLS-----------*/
  let mouse = {
    x: innerWidth / 2,
    y: innerHeight - 33,
  };

  // Event listeners for mouse and touch controls
  canvasElement.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
  });

  canvasElement.addEventListener("touchmove", (event) => {
    const touch = event.changedTouches[0];
    mouse.x = touch.clientX;
    event.preventDefault();
  });

  /*-----------GAME VARIABLES-----------*/
  const player = {
    width: 32,
    height: 32,
    img: new Image(),
    score: 0,
    health: 1000000,
  };

  const assets = {
    ships: [
      "https://image.ibb.co/n8rayp/rocket.png",
      "https://image.ibb.co/dfbD1U/heroShip.png",
    ],
    enemy: "https://image.ibb.co/bX9UuU/ufo_1.png",
    healthKit: "https://image.ibb.co/iTrjuU/hospital.png",
    bulletSound: "https://www.dropbox.com/s/w70c8hyryak6w40/Laser-SoundBible.com-602495617.mp3?dl=0",
  };

  let bullets = [];
  let enemies = [];
  let healthKits = [];

  const bullet = {
    width: 6,
    height: 28,
    speed: 6,
  };

  const enemy = {
    width: 32,
    height: 32,
    speed: 4.5,
  };

  const healthKit = {
    width: 32,
    height: 32,
    speed: 2.6,
  };

  // Player selection
  function choosePlayer() {
    const userInput = prompt(
      "🚀SELECT YOUR BATTLESHIP!🚀\n1: Orange Ship\n2: Blue Ship",
      "1"
    );
    player.img.src = assets.ships[userInput === "2" ? 1 : 0];
  }
  choosePlayer();

  /*-----------GAME OBJECTS-----------*/
  class GameObject {
    constructor(x, y, width, height, img, speed = 0) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.img = img;
      this.speed = speed;
    }

    draw() {
      c.drawImage(this.img, this.x, this.y, this.width, this.height);
    }

    update() {
      this.y += this.speed;
      this.draw();
    }
  }

  // Fire bullets
  function fireBullet() {
    const bulletObj = new GameObject(
      mouse.x - bullet.width / 2,
      mouse.y - player.height,
      bullet.width,
      bullet.height,
      null,
      -bullet.speed
    );
    bullets.push(bulletObj);
  }

  // Spawn enemies
  function spawnEnemies() {
    for (let i = 0; i < 4; i++) {
      const x = Math.random() * (canvasElement.width - enemy.width);
      const y = -enemy.height;
      const speed = Math.random() * enemy.speed + 1;
      const enemyObj = new GameObject(
        x,
        y,
        enemy.width,
        enemy.height,
        new Image(),
        speed
      );
      enemyObj.img.src = assets.enemy;
      enemies.push(enemyObj);
    }
  }
  setInterval(spawnEnemies, 1500);

  // Spawn health kits
  function spawnHealthKits() {
    const x = Math.random() * (canvasElement.width - healthKit.width);
    const y = -healthKit.height;
    const speed = Math.random() * healthKit.speed + 1;
    const healthKitObj = new GameObject(
      x,
      y,
      healthKit.width,
      healthKit.height,
      new Image(),
      speed
    );
    healthKitObj.img.src = assets.healthKit;
    healthKits.push(healthKitObj);
  }
  setInterval(spawnHealthKits, 15000);

  /*-----------COLLISION DETECTION-----------*/
  function detectCollision(a, b) {
    return (
      a.x < b.x + b.width &&
      a.x + a.width > b.x &&
      a.y < b.y + b.height &&
      a.y + a.height > b.y
    );
  }

  /*-----------GAME LOOP-----------*/
  function gameLoop() {
    c.clearRect(0, 0, canvasElement.width, canvasElement.height);

    // Draw score and health
    c.fillStyle = "white";
    c.font = "16px Arial";
    c.fillText(`Score: ${player.score}`, 10, 20);
    c.fillText(`Health: ${player.health}`, canvasElement.width - 100, 20);

    // Draw player
    c.drawImage(player.img, mouse.x - player.width / 2, mouse.y - player.height);

    // Update bullets
    bullets = bullets.filter((bulletObj) => {
      bulletObj.update();
      return bulletObj.y > 0;
    });

    // Update enemies
    enemies = enemies.filter((enemyObj) => {
      enemyObj.update();
      if (enemyObj.y > canvasElement.height) {
        player.health -= 10;
        return false;
      }
      return true;
    });

    // Check collisions between bullets and enemies
    for (let i = enemies.length - 1; i >= 0; i--) {
      for (let j = bullets.length - 1; j >= 0; j--) {
        if (detectCollision(enemies[i], bullets[j])) {
          enemies.splice(i, 1);
          bullets.splice(j, 1);
          player.score += 10;
          break;
        }
      }
    }

    // Update health kits
    healthKits = healthKits.filter((healthKitObj) => {
      healthKitObj.update();
      if (detectCollision(healthKitObj, { x: mouse.x, y: mouse.y, width: 1, height: 1 })) {
        player.health += 10;
        return false;
      }
      return true;
    });

    // Check for game over
    if (player.health <= 0) {
      alert(`Game Over! Your score: ${player.score}`);
      window.location.reload();
    }

    requestAnimationFrame(gameLoop);
  }

  gameLoop();

  // Event listener for firing bullets
  canvasElement.addEventListener("click", fireBullet);
  window.addEventListener("resize", () => {
    canvasElement.width = innerWidth;
    canvasElement.height = innerHeight;
  });
};
