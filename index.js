var canvas = document.getElementById("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
var ctx = canvas.getContext("2d")
var particlesArray = []
var count = parseInt(canvas.height / 200 * canvas.width / 200)

var isTracking = false;  // 是否启动跟踪
var trackingIndex = -1;  // 跟踪的粒子索引
var zoomLevel = 2;       // 放大倍数

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
        const strength2 = 0.15 / distance;  // 强度与距离成正比，可以调整系数以改变效果

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

// canvas.addEventListener('click', function(event) {
//     const rect = canvas.getBoundingClientRect();
//     const x = event.clientX - rect.left;
//     const y = event.clientY - rect.top;
//     for (let i = 0; i < particlesArray.length; i++) {
//         if (particlesArray[i].withinRange(x, y)) {
//             isTracking = true;
//             trackingIndex = i;
//             break;
//         }
//     }
// });

canvas.addEventListener('click', function(event) {
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let clickedOnParticle = false;

    for (let i = 0; i < particlesArray.length; i++) {
        if (particlesArray[i].withinRange(x, y)) {
            if (isTracking && trackingIndex === i) {
                // 如果已经在跟踪这个粒子，再次点击取消跟踪
                isTracking = false;
                trackingIndex = -1;
            } else {
                // 否则开始跟踪这个粒子
                isTracking = true;
                trackingIndex = i;
            }
            clickedOnParticle = true;
            break;
        }
    }

    // 如果没有点击任何粒子，并且当前处于跟踪状态，则取消跟踪
    if (!clickedOnParticle && isTracking) {
        isTracking = false;
        trackingIndex = -1;
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

    ctx.setTransform(1, 0, 0, 1, 0, 0); // 重置变换，确保清除操作覆盖整个画布    
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // drawGrid();  // 绘制网格背景

    if (isTracking && trackingIndex >= 0 && trackingIndex < particlesArray.length) {
        const particle = particlesArray[trackingIndex];
        ctx.setTransform(zoomLevel, 0, 0, zoomLevel, -particle.x * zoomLevel + canvas.width / 2, -particle.y * zoomLevel + canvas.height / 2);
    } else {
        ctx.setTransform(1, 0, 0, 1, 0, 0);  // 重置变换矩阵
    }
    if (particlesArray.length < count) {
        createParticle();
    }
    drawLines();
    handleParticle();
}


setInterval(() => {
    draw(), 1
})


// 初始化canvas大小
function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', function() {
    initCanvas();
    isTracking = false;  // 取消跟踪
    trackingIndex = -1;  // 重置跟踪索引
    particlesArray = [];
    for (let i = 0; i < count; i++) {
        createParticle();
    }
});

initCanvas();  // 初始化调用，确保在页面加载时设置正确的大小


// function drawGrid() {
//     const gridSpacing = 50;  // 网格间距50像素
//     ctx.strokeStyle = 'rgba(200, 200, 200, 0.5)';  // 浅灰色，半透明
//     ctx.lineWidth = 1;  // 网格线宽度

//     // 绘制垂直线
//     for (let x = 0; x <= canvas.width; x += gridSpacing) {
//         ctx.beginPath();
//         ctx.moveTo(x, 0);
//         ctx.lineTo(x, canvas.height);
//         ctx.stroke();
//     }

//     // 绘制水平线
//     for (let y = 0; y <= canvas.height; y += gridSpacing) {
//         ctx.beginPath();
//         ctx.moveTo(0, y);
//         ctx.lineTo(canvas.width, y);
//         ctx.stroke();
//     }
// }
