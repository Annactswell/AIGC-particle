const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const backgroundLayer = document.getElementById('backgroundLayer');

let particlesArray = [];
const particleCount = () => parseInt(canvas.height / 200 * canvas.width / 200);

let originalBackgroundImage = 'url(white.png)';

let isTracking = false;  // 是否启动跟踪
let trackingIndex = -1;  // 跟踪的粒子索引
const zoomLevel = 5;     // 放大倍数

// 平滑过渡状态
let targetTransform = { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
let currentTransform = { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };
const smoothness = 0.05; // 控制过渡的平滑程度

class Particle {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.color = "gray";
        this.speedFactor = 1;
        this.directionY = Math.random() - 0.5;
        this.directionX = Math.random() - 0.5;
        this.text = (Math.random() * 100).toFixed(0);
    }

    update() {
        // const centerX = canvas.width / 2;
        // const centerY = canvas.height / 2;
        // const dx = centerX - this.x;
        // const dy = centerY - this.y;
        // const distance = Math.sqrt(dx ** 2 + dy ** 2);

        // const forceDirectionX = dx / distance;
        // const forceDirectionY = dy / distance;
        // const strength = 0.0005 * Math.pow(2, 0.00001 * distance);
        // const strength2 = 0.15 / distance;

        // this.directionX += (forceDirectionX * strength) - (forceDirectionX * strength2);
        // this.directionY += (forceDirectionY * strength) - (forceDirectionY * strength2);

        this.y += 30 * this.directionY * 0.05 * this.speedFactor;
        this.x += 30 * this.directionX * 0.05 * this.speedFactor;

        this.bounce();
    }

    bounce() {
        if (this.x <= 10 || this.x >= canvas.width - 10) this.directionX = -this.directionX;
        if (this.y <= 10 || this.y >= canvas.height - 10) this.directionY = -this.directionY;
    }

    draw() {
        
        if (isTracking && particlesArray[trackingIndex] === this) ctx.fillStyle = "#8df2f2";  // 被放大的粒子颜色
        else ctx.fillStyle = this.color;  // 其他粒子使用默认颜色
    
        ctx.beginPath();
        ctx.arc(this.x, this.y, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText(this.text, this.x, this.y + 20);
    }

    withinRange(x, y) {
        const distance = Math.sqrt((x - this.x) ** 2 + (y - this.y) ** 2);
        return distance <= 20;
    }
}

function handleParticles() {
    particlesArray.forEach((particle, index) => {
        particle.update();
        particle.draw();
    });
}

function drawLines() {
    particlesArray.forEach((p1, i) => {
        particlesArray.slice(i + 1).forEach(p2 => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx ** 2 + dy ** 2);
            if (distance < 200) {
                ctx.strokeStyle = `rgba(128, 128, 128, ${1 - distance / 200})`;
                ctx.lineWidth = 2 * (1 - distance / 200);
                ctx.beginPath();
                ctx.moveTo(p1.x, p1.y);
                ctx.lineTo(p2.x, p2.y);
                ctx.stroke();
            }
        });
    });
}

function draw() {
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (isTracking && trackingIndex >= 0 && trackingIndex < particlesArray.length) {
        const particle = particlesArray[trackingIndex];
        const targetX = -particle.x * zoomLevel + canvas.width / 4;
        const targetY = -particle.y * zoomLevel + canvas.height / 2;
        
        // 平滑过渡
        currentTransform.scaleX += (zoomLevel - currentTransform.scaleX) * smoothness;
        currentTransform.scaleY += (zoomLevel - currentTransform.scaleY) * smoothness;
        currentTransform.offsetX += (targetX - currentTransform.offsetX) * smoothness;
        currentTransform.offsetY += (targetY - currentTransform.offsetY) * smoothness;

        ctx.setTransform(currentTransform.scaleX, 0, 0, currentTransform.scaleY, currentTransform.offsetX, currentTransform.offsetY);
    }

    if (particlesArray.length < particleCount()) {
        createParticle();
    }
    drawLines();
    handleParticles();
}

function createParticle() {
    const x = Math.random() * canvas.width;
    const y = Math.random() * canvas.height;
    particlesArray.push(new Particle(x, y));
}

function initCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    resetParticles();
    // canvas.style.backgroundImage = 'url(white.png)';
    // originalBackgroundImage = canvas.style.backgroundImage; // 保存原始背景图片
    backgroundLayer.style.backgroundImage = originalBackgroundImage;
    backgroundLayer.style.backgroundSize = 'cover';  // 自适应填充画布大小
    backgroundLayer.style.opacity = '0';

}

function resetParticles() {
    isTracking = false;
    trackingIndex = -1;
    particlesArray = [];
    for (let i = 0; i < particleCount(); i++) {
        createParticle();
    }
}

window.addEventListener('resize', initCanvas);
canvas.addEventListener('click', onClick);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mousedown', onMouseDown);
canvas.addEventListener('mousemove', onMouseMove);
canvas.addEventListener('mouseup', onMouseUp);
setInterval(draw, 16); // 60 fps
initCanvas();

function onClick(event) {
    const backgroundLayer = document.getElementById('backgroundLayer');
    const { clientX, clientY } = event;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const clickedParticleIndex = particlesArray.findIndex(particle => particle.withinRange(x, y));

    if (clickedParticleIndex !== -1) {
        isTracking = !isTracking;
        trackingIndex = isTracking ? clickedParticleIndex : -1;

        if (isTracking) {
            // 添加平滑渐变过渡动画
            backgroundLayer.style.transition = 'opacity 1s ease-in-out';
            backgroundLayer.style.backgroundImage = 'url(background2.png)'; // 切换背景图片
            backgroundLayer.style.backgroundSize = 'cover'; // 自适应填充画布大小
            backgroundLayer.style.opacity = '1'; // 透明度从0变为1
        } else {
            // 添加平滑渐变过渡动画
            backgroundLayer.style.transition = 'opacity 1s ease-in-out';
            backgroundLayer.style.backgroundImage = originalBackgroundImage; // 切换背景图片
            backgroundLayer.style.opacity = '0'; // 透明度从1变为0
        }
    } else if (isTracking) {
        isTracking = false;
        trackingIndex = -1;
        // 添加平滑渐变过渡动画
        backgroundLayer.style.transition = 'opacity 1s ease-in-out';
        backgroundLayer.style.backgroundImage = originalBackgroundImage; // 切换背景图片
        backgroundLayer.style.opacity = '0'; // 透明度从1变为0
    }
}


function clearWordCloud() {
    const canvasElement = document.getElementById('canvas');
    const context = canvasElement.getContext('2d');
    context.clearRect(0, 0, canvasElement.width, canvasElement.height);
}

let isMouseDown = false;
let dragParticleIndex = -1;
let mouseX = 0;
let mouseY = 0;
let particleOffsetX = 0;
let particleOffsetY = 0;

function onMouseDown(event) {
    const { clientX, clientY } = event;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    dragParticleIndex = particlesArray.findIndex(particle => particle.withinRange(x, y));
    if (dragParticleIndex !== -1) {
        isMouseDown = true;
        mouseX = x;
        mouseY = y;
        particleOffsetX = particlesArray[dragParticleIndex].x - mouseX;
        particleOffsetY = particlesArray[dragParticleIndex].y - mouseY;
        particlesArray[dragParticleIndex].speedFactor = 0; // 拖动时停止粒子运动
        particlesArray[dragParticleIndex].color = '#6495ED'; // 拖动时将粒子颜色设置为蓝色
    }
}

function onMouseMove(event) {
    if (!isMouseDown) {
        const {clientX, clientY} = event;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        particlesArray.forEach(particle => {
            if (particle.withinRange(x, y)) {
                particle.color = '#8df2f2';
                particle.speedFactor = 0.5;
            } else {
                particle.color = 'gray';
                particle.speedFactor = 1;
            }
        });
    } else {
        const { clientX, clientY } = event;
        const rect = canvas.getBoundingClientRect();
        const x = clientX - rect.left;
        const y = clientY - rect.top;
        particlesArray[dragParticleIndex].x = x + particleOffsetX;
        particlesArray[dragParticleIndex].y = y + particleOffsetY;
    }
}


function onMouseUp() {
    if (isMouseDown && dragParticleIndex !== -1) {
        isMouseDown = false;
        particlesArray[dragParticleIndex].speedFactor = 1; // 松开鼠标时恢复粒子速度
        particlesArray[dragParticleIndex].color = 'gray'; // 松开鼠标时恢复粒子颜色
    }
}


