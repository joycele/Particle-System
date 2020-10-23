// Joyce Le
console.log("particle simulation system")


//// **************** VARIABLE DECLARATIONS *********************

var images = {1: 'winter.jpg', 2: 'spring.jpg', 3: 'summer.jpg', 4: 'autumn.jpg'},
    sounds = {1: 'winter.mp3', 2: 'spring.mp3', 3: 'summer.mp3', 4: 'autumn.mp3'},
    sims = {1: {count: 250, size: [0, 22], velX: 0, velY: 0.33, design: ["❄", "❅", "❆"], rgb: [163, 200, 255]},
            2: {count: 12, size: [20, 27], design: ["♩", "♫", "♬", "♭", "♪", "♯", "♬♪"], rgb: [0, 0, 0]},
            3: {count: 50, size: [5, 7], minGrowth: 0.01, speed: 0.3, 
                rgb: ["249, 251, 147", "255, 255, 255", "224, 242, 255", "235, 255, 214", "255, 235, 235"]},
            4: {count: 30, velX: 0, velY: 0.33, design: ["leaf.png"]}},
    currentSim = 0,
    particles = [],
    paused = true,  // all simulations start in the paused state
    canvas = document.getElementById('canvas')
    canvas.width = 1400;
    canvas.height = 600;  
    ctx = canvas.getContext('2d');
    animationCanvas = document.getElementById('animation')
    animationCanvas.width = 1400;
    animationCanvas.height = 600;
    animationCtx = animationCanvas.getContext('2d');
    $=document.getElementById.bind(document);


//// ***************** CODE FOR SETTING UP BROWSER PAGE *******************

// set up canvas for each simulation selection
function updateCanvas(object, songID) {
    animationCtx.clearRect(0, 0, canvas.width, canvas.height);
    currentSim = object.selectedIndex;
    console.log("current selected simulation: " + currentSim);
    paused = true;
    if (currentSim < 5) {
        // options 1-4 have images and soundtracks to go along with animations ヽ(*⌒▽⌒*)ﾉ
        $(songID).src = sounds[currentSim];
        changeImage(currentSim);
    } else {
        $(songID).src = null;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    particles = [];
    init();
}

// displays an image on the canvas
function changeImage(i) {
    img = new Image();
    img.src = images[i];
    img.onload = function(){
        ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width, canvas.height);
    }
}

// on click of play button, pause or play the simulation
function playPause() {
    if (currentSim > 0) {  // make sure user has selected a sim 
        var song = document.getElementById('song');
        if (paused) {
            paused = false;
            if (currentSim < 5) {song.play()}
            requestAnimationFrame(animate);
        } else {
            paused = true;
            if (currentSim < 5) {song.pause();}
        }
    }
}

// on click of add button, prompt user to add a simulation
function addSim() {
    document.getElementById('addSimForm').style.display = "block";
}

// close pop-up when user cancels on a form
function closeForm() {
    document.getElementById('addSimForm').style.display = "none";
}

// parse new simulation
var addForm = document.getElementById("newForm");
function parseNewSim(event) {
    event.preventDefault();
    var form = document.getElementById("newForm");
    var simNum = Object.keys(sims).length + 1;
    var newEntry = { 
        count: parseInt(form.count.value),
        size: [parseInt(form.size.value), parseInt(form.size.value)],
        velX: parseInt(form.velX.value),
        velY: parseInt(form.velY.value),
        design: [form.design.value],
        rgb: [0,0,0]
    } 
    sims[simNum] = newEntry
    var selectForm = document.getElementById("simSelection");
    var newOption = document.createElement('option');
    newOption.value = form.name.value;
    newOption.innerHTML = form.name.value;
    selectForm.appendChild(newOption);
    closeForm();
    document.getElementById('newForm').reset();
}
addForm.addEventListener('submit', parseNewSim);

////  **************** CODE FOR ANIMATING SIMULATIONS *********************

window.requestAnimationFrame = requestAnimationFrame;

// preload 30 leaf images needed for simulation 4

function getRandomInt(min, max) {
    return min + Math.floor(Math.random() * (max - min));
}

// animate the particles 
function animate() {
    if (paused) {return;}
    animationCtx.clearRect(0, 0, canvas.width, canvas.height);
    animationCtx.shadowBlur = 0;
    for (var i = 0; i < particles.length; i++) {
        // update animation movement
        var par = particles[i]
        if (currentSim == 1 || currentSim > 4) {  // snowfall simulation, user-added simulations
            par.y += par.velY;
            par.x += par.velX;
            if (par.y >= canvas.height) { reset(par); }
            if (par.x >= canvas.width) { reset(par); }
            if (currentSim == 1) { 
                animationCtx.shadowColor = 'white';
                animationCtx.shadowBlur = 10; 
            } 
            color = sims[currentSim].rgb;
            animationCtx.fillStyle = "rgb(" + color[0] + "," + color[1] + "," + color[2] + ")";
            animationCtx.font = par.size + "px Times New Roman";
            animationCtx.fillText(par.design, par.x, par.y);
        } else if (currentSim == 2) {  // flowing music notes simulation
            par.y -= par.speed
            if (par.type == "flute") { par.x -= par.speed; }
            if (par.type == "zither") { par.x -= par.speed/10; }
            if (par.y < par.startY) { par.opacity -= 0.01; }
            if (par.opacity <= 0.1) { reset(par); }
            color = sims[currentSim].rgb;
            if (par.y < par.startY) {
                animationCtx.fillStyle = "rgba(" + color[0] + "," + color[1] + "," + color[2] + "," + par.opacity + ")";
                animationCtx.font = par.size + "px Arial";
                animationCtx.fillText(par.design, par.x, par.y);
            }
        } else if (currentSim == 3) {  // sunlight simulation
            par.opacity -= par.speed;
            par.size += 1;
            if (par.opacity <= 0.05) { reset(par); }
            color = sims[currentSim].rgb;
            animationCtx.fillStyle = "rgba(" + par.rgb + "," + par.opacity + ")";
            animationCtx.shadowColor = 'white';
            animationCtx.shadowBlur = 13;
            if (par.speed <= 0.02) {
                animationCtx.beginPath();
                animationCtx.arc(par.x, par.y, par.size, 0, 2 * Math.PI);
                animationCtx.fill();
            }
        } else if (currentSim == 4) {  // falling leaves simulation
            par.y += par.velY;
            par.x += par.velX;
            if (par.y >= canvas.height) { reset(par); }
            if (par.x >= canvas.width) { reset(par); }
            if (par.y > 100 || par.x < 600) { 
                animationCtx.drawImage(par.design, par.x, par.y, par.x/13, par.y/13); 
            }
        } 
    }
    requestAnimationFrame(animate);
};

// reset the particle locations
function reset(particle) {
    simulation = sims[currentSim];
    var d = simulation.design;
    if (currentSim == 1 || currentSim > 4) {  // reset particles for simulations 1, user-added simulations 
        particle.x = Math.floor(Math.random() * canvas.width);
        particle.y = 0;
        particle.velX = simulation.velX;
        particle.velY = Math.random() + simulation.velY;
        particle.size = getRandomInt(simulation.size[0], simulation.size[1]);
        particle.design = d[Math.floor(Math.random() * d.length)];
    } else if (currentSim == 2) {  // reset particles for simulation 2
        particle.x = particle.startX
        particle.y = getRandomInt(particle.startY, particle.startY + particle.stagger)
        particle.size = getRandomInt(simulation.size[0], simulation.size[1]);
        particle.speed = getRandomInt(1, 3);
        particle.opacity = 1;
        particle.design = d[Math.floor(Math.random() * d.length)];
    } else if (currentSim == 3) {  // reset particles for simulation 3
        var rgba = simulation.rgb;
        particle.x = getRandomInt(300, 1100);
        particle.y = getRandomInt(100, 350);
        particle.size = getRandomInt(simulation.size[0], simulation.size[1]),
        particle.speed = simulation.minGrowth + Math.random()/simulation.speed,
        particle.rgb = rgba[Math.floor(Math.random() * rgba.length)],
        particle.opacity = 0.7;
    } else if (currentSim == 4) {  // reset images for simulation 4
        particle.x = getRandomInt(0, canvas.width - 150);
        particle.y = 0;
    }
}

// initialize all the paricles with their specific properties
function init() {
    simulation = sims[currentSim];
    var d = simulation.design;
    if (currentSim == 1 || currentSim > 4) {  // falling particle simulation for simulations 1, user-added 
        for (var i = 0; i < simulation.count; i++) {
            x = {
                x: getRandomInt(0, canvas.width),
                y: -1 * getRandomInt(0, canvas.height),
                velX: simulation.velX,
                velY: Math.random() + simulation.velY,
                size: getRandomInt(simulation.size[0], simulation.size[1]),
                design: d[Math.floor(Math.random() * d.length)]
            }
            particles.push(x);
        }
    } else if (currentSim == 2) {  // music simulation for simulation 2
        for (var i = 0; i < simulation.count; i++) {
            if ([1, 3, 6, 9].includes(i)) {
                particles.push({
                    type: "zither",
                    x: 1075,
                    y: getRandomInt(420, 420 + 250),
                    startX: 1075,
                    startY: 420,
                    speed: getRandomInt(1, 3),
                    stagger: 250,
                    size: getRandomInt(simulation.size[0], simulation.size[1]),
                    design: d[Math.floor(Math.random() * d.length)],
                    opacity: 1
                })
            } else {
                particles.push({
                    type: "flute",
                    x: 900,
                    y: getRandomInt(285, 280 + 175),
                    startX: 900,
                    startY: 285,
                    speed: getRandomInt(1, 3),
                    stagger: 175,
                    size: getRandomInt(simulation.size[0], simulation.size[1]),
                    design: d[Math.floor(Math.random() * d.length)],
                    opacity: 1
                })
            }
        }
    } else if (currentSim == 3) {  // sunlight simulation for simulation 3
        var rgba = simulation.rgb;
        for (var i = 0; i < simulation.count; i++) {
            particles.push({
                x: getRandomInt(300, 1100),
                y: getRandomInt(100, 350),
                size: getRandomInt(simulation.size[0], simulation.size[1]),
                speed: simulation.minGrowth + Math.random()/simulation.speed,
                rgb: rgba[Math.floor(Math.random() * rgba.length)],
                opacity: 0.7,
            })
        }
    } else if (currentSim == 4) {  // leaf simulation for simulation 4
        for (var i = 0; i < simulation.count; i++) {
            leaf = new Image();
            leaf.src = d[0];
            leaf.onload = animate;
            particles.push({
                x: getRandomInt(0, canvas.width - 150),
                y: -1 * getRandomInt(0, canvas.height),
                velX: simulation.velX,
                velY: Math.random() + simulation.velY,
                design: leaf
            })
        }
    }
    animate();
};