var canvas = document.getElementById("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
var ctx = canvas.getContext("2d")
var particlesArray = []
var count = parseInt(canvas.height / 200 * canvas.width / 200)

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.directionY = 0.5 - Math.random();
        this.directionX = 0.5 - Math.random();
    }
    update() {
        this.y += this.directionY * 0.15;
        this.x += this.directionX * 0.15;
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 5, 0, Math.PI * 2);  // 粒子大小为5像素
        ctx.fillStyle = "rgba(128, 128, 128, 1)";
        ctx.fill();
    }
}

function handleParticle() {
    for (var i = 0; i < particlesArray.length; i++) {
        var particle = particlesArray[i];
        particle.update();
        particle.draw();
        if (particle.x < 0 || particle.x > canvas.width || particle.y < 0 || particle.y > canvas.height) {
            particlesArray.splice(i, 1);
        }
        for (var j = i; j < particlesArray.length; j++) {
            var dx = particlesArray[i].x - particlesArray[j].x;
            var dy = particlesArray[i].y - particlesArray[j].y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 200) {
                ctx.beginPath();
                ctx.strokeStyle = "rgba(128, 128, 128," + (1 - distance / 200) + ")";  // 根据距离计算透明度
                ctx.lineWidth = 2 * (1 - distance / 200);  // 根据距离计算线宽
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                ctx.stroke();
            }
        }
    }
}


function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (particlesArray.length < count) {
        createParticle();
    }
    handleParticle();
}
setInterval(() => {
    draw(), 1
})













function createParticle() {
    var x = Math.random() * canvas.width
    var y = Math.random() * canvas.height
    particlesArray.push(new Particle(x, y))
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    if (particlesArray.length < count) {
        createParticle()
    }
    handleParticle()
}
setInterval(() => {
    draw(), 1
})