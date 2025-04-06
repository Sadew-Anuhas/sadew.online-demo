// Ensure p5 is loaded before running this script
if (typeof p5 === 'undefined') { console.error('p5.js library not found!'); }
else {
    const p5Container = document.getElementById('p5-canvas-container');
    if (!p5Container) { /* Optional: console.warn('p5.js container not found!'); */ }
    else {
        const sketch = (p) => {
            let walkers = []; const numWalkers = 30; let parentWidth, parentHeight; const interactionRadius = 100;
            class Walker {
                constructor() { parentWidth = p5Container.offsetWidth; parentHeight = p5Container.offsetHeight; this.pos = p.createVector(p.random(parentWidth), p.random(parentHeight)); this.history = [this.pos.copy()]; this.maxHistory = 80; this.baseColors = [ p.color(31, 41, 55, 100), p.color(107, 114, 128, 100), p.color(37, 99, 235, 90), p.color(20, 184, 166, 90) ]; this.baseColor = p.random(this.baseColors); this.currentColor = this.baseColor; this.baseStrokeW = p.random(0.7, 1.8); this.currentStrokeW = this.baseStrokeW; this.velocity = p5.Vector.random2D().mult(p.random(0.3, 1.2)); this.noiseOffset = p.random(1000); this.noiseScale = 0.006; this.noiseStrength = 0.1; this.maxSpeed = 1.2; }
                interact(mouseX, mouseY) { let d = p.dist(mouseX, mouseY, this.pos.x, this.pos.y); if (d < interactionRadius) { let repel = p5.Vector.sub(this.pos, p.createVector(mouseX, mouseY)); repel.setMag(p.map(d, 0, interactionRadius, 0.5, 0)); this.velocity.add(repel); this.velocity.limit(this.maxSpeed * 2.5); this.currentColor = p.lerpColor(p.color(p.red(this.baseColor), p.green(this.baseColor), p.blue(this.baseColor), 200), this.baseColor, p.map(d, 0, interactionRadius, 0, 1)); this.currentStrokeW = this.baseStrokeW + p.map(d, 0, interactionRadius, 1.5, 0); } else { this.velocity.limit(this.maxSpeed); this.currentColor = p.lerpColor(this.currentColor, this.baseColor, 0.1); this.currentStrokeW = p.lerp(this.currentStrokeW, this.baseStrokeW, 0.1); } }
                step() { let angle = p.noise(this.pos.x * this.noiseScale, this.pos.y * this.noiseScale, this.noiseOffset + p.frameCount * 0.001) * p.TWO_PI * 4; let noiseForce = p5.Vector.fromAngle(angle); noiseForce.mult(this.noiseStrength); this.velocity.add(noiseForce); this.pos.add(this.velocity); this.wrapEdges(); this.history.push(this.pos.copy()); if (this.history.length > this.maxHistory) { this.history.splice(0, 1); } }
                wrapEdges() { let buffer = this.maxHistory; if (this.pos.x > parentWidth + buffer) this.pos.x = -buffer; else if (this.pos.x < -buffer) this.pos.x = parentWidth + buffer; if (this.pos.y > parentHeight + buffer) this.pos.y = -buffer; else if (this.pos.y < -buffer) this.pos.y = parentHeight + buffer; }
                display() { p.noFill(); p.stroke(this.currentColor); p.strokeWeight(this.currentStrokeW); p.beginShape(); for (let v of this.history) { p.vertex(v.x, v.y); } p.endShape(); }
            }
            p.setup = () => { parentWidth = p5Container.offsetWidth; parentHeight = p5Container.offsetHeight; if(parentWidth > 0 && parentHeight > 0) { let canvas = p.createCanvas(parentWidth, parentHeight); canvas.parent('p5-canvas-container'); p.frameRate(30); walkers = []; for (let i = 0; i < numWalkers; i++) { walkers.push(new Walker()); } } else { console.warn("p5 container has no dimensions"); } };
            p.draw = () => { if(p.canvas) { p.background(241, 245, 249, 45); let mouseIsInside = p.mouseX >= 0 && p.mouseX <= p.width && p.mouseY >= 0 && p.mouseY <= p.height; for (let walker of walkers) { if(mouseIsInside) { walker.interact(p.mouseX, p.mouseY); } else { walker.interact(Infinity, Infinity); } walker.step(); walker.display(); } } };
            p.windowResized = () => { if (p5Container && (p5Container.offsetWidth !== parentWidth || p5Container.offsetHeight !== parentHeight)) { parentWidth = p5Container.offsetWidth; parentHeight = p5Container.offsetHeight; if(parentWidth > 0 && parentHeight > 0) { p.resizeCanvas(parentWidth, parentHeight); walkers = []; for (let i = 0; i < numWalkers; i++) { walkers.push(new Walker()); } } } };
        };
        if (p5Container) { new p5(sketch); }
    }
}