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
        this.color = "gray"; // 默认颜色为灰色
        this.speedFactor = 1;
        this.directionY = 0.5 - Math.random();
        this.directionX = 0.5 - Math.random();
        this.text = Math.random();
    }
    
    update() {

        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const dx = centerX - this.x;
        const dy = centerY - this.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // 吸引力随距离增大而增强
        const forceDirectionX = dx / distance;  // 计算方向单位向量
        const forceDirectionY = dy / distance;  // 计算方向单位向量
        const strength = 0.0005 * Math.pow(2, 0.00001 * distance);  // 强度与距离成正比，可以调整系数以改变效果
        const strength2 = 0.2 / distance;  // 强度与距离成正比，可以调整系数以改变效果

        this.directionX += forceDirectionX * strength - forceDirectionX * strength2;
        this.directionY += forceDirectionY * strength - forceDirectionY * strength2;

        this.y += this.directionY * 0.05 * this.speedFactor;
        this.x += this.directionX * 0.05 * this.speedFactor;

        if (this.x <= 1 || this.x >= canvas.width - 1) {
            this.directionX = -this.directionX;  // X方向反弹
        }
        if (this.y <= 1 || this.y >= canvas.height - 1) {
            this.directionY = -this.directionY;  // Y方向反弹
        }
    }
    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);  // 粒子大小为5像素
        ctx.fillStyle = this.color;
        ctx.fill();

        // 绘制文字
        ctx.font = "12px Arial";  // 设置字体大小和类型
        ctx.fillStyle = this.color;  // 设置字体颜色
        ctx.textAlign = "center";  // 水平居中文字
        ctx.fillText(this.text, this.x, this.y + 20);  // 在粒子下方20像素处绘制文字
    }
    withinRange(x, y) {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= 20;  // 5像素半径 + 15像素点击容忍度
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
        // for (var j = i + 1; j < particlesArray.length; j++) {
        //     var dx = particlesArray[i].x - particlesArray[j].x;
        //     var dy = particlesArray[i].y - particlesArray[j].y;
        //     var distance = Math.sqrt(dx * dx + dy * dy);
        //     if (distance < 200) {
        //         ctx.beginPath();
        //         ctx.strokeStyle = "rgba(128, 128, 128," + (1 - distance / 200) + ")";  // 根据距离计算透明度
        //         ctx.lineWidth = 2 * (1 - distance / 200);  // 根据距离计算线宽
        //         ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
        //         ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
        //         ctx.stroke();
        //     }
        // }
    }
}

function drawLines() {
    
    for (var i = 0; i < particlesArray.length; i++) {
        for (var j = i + 1; j < particlesArray.length; j++) {
            var dx = particlesArray[i].x - particlesArray[j].x;
            var dy = particlesArray[i].y - particlesArray[j].y;
            var distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 200) {
                ctx.beginPath();
                ctx.strokeStyle = "rgba(128, 128, 128," + (1 - distance / 200) + ")";
                ctx.lineWidth = 2 * (1 - distance / 200);
                ctx.moveTo(particlesArray[i].x, particlesArray[i].y);
                ctx.lineTo(particlesArray[j].x, particlesArray[j].y);
                ctx.stroke();
            }
        }
    }
}


setInterval(() => {
    draw(), 1
})

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;  // 计算相对于canvas的x坐标
    const y = event.clientY - rect.top;   // 计算相对于canvas的y坐标
    for (let particle of particlesArray) {
        if (particle.withinRange(x, y)) {
            alert('Clicked on a particle!');
            break;
        }
    }
});

canvas.addEventListener('mousemove', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let particleHovered = false;
    particlesArray.forEach(particle => {
        if (particle.withinRange(x, y)) {
            particle.color = '#8df2f2'; // 当鼠标悬停时变为蓝色
            particle.speedFactor = 0.5;  // 降低速度
        } else {
            particle.color = 'gray'; // 否则变回灰色
            particle.speedFactor = 1;  // 恢复速度
        }
    });
});

function createParticle() {
    var x = Math.random() * canvas.width
    var y = Math.random() * canvas.height
    particlesArray.push(new Particle(x, y))
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (particlesArray.length < count) {
        createParticle();
    }
    drawLines();       // 首先绘制所有连线
    handleParticle();  // 然后处理所有粒子的绘制，包括它们的更新和绘图
}

setInterval(() => {
    draw(), 1
})


// 初始化canvas大小
function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

// 当窗口大小变化时调整canvas大小
window.addEventListener('resize', function() {
    initCanvas();
    // 重新绘制或重置粒子，确保它们在新的画布大小内正确显示
    particlesArray = [];  // 可能需要清空并重新生成粒子，根据你的需要调整这里
    for (let i = 0; i < count; i++) {
        createParticle();  // 重新生成粒子
    }
});

initCanvas();  // 初始化调用，确保在页面加载时设置正确的大小

// 其余的代码逻辑保持不变，确保在调整大小后重新绘制canvas内容

