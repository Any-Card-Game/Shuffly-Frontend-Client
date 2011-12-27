var DEBUG = false;


var WireColor = "rgb(255,255,255)";
function Vector2D() { }

Vector2D.Add = function (vc, v) {
    return { x: vc.x + v.x, y: vc.y + v.y };
};
Vector2D.Sub = function (vc, v) {
    return { x: vc.x - v.x, y: vc.y - v.y };
};
Vector2D.Mul = function (vc, v) {
    return { x: vc.x * v, y: vc.y * v };
};
Vector2D.Div = function (vc, v) {
    return { x: vc.x / v, y: vc.y / v };
};
Vector2D.Neg = function (vc) {
    return { x: -vc.x, y: -vc.y };
};

Vector2D.length = function (vt) {
    return Math.sqrt(vt.x * vt.x + vt.y * vt.y);
};


function Mass(m) {
    this.m = m;
    this.pos = { x: 0, y: 0 };
    this.vel = { x: 0, y: 0 };
    this.force = { x: 0, y: 0 };

    this.applyForce = function (force) {
        this.force = Vector2D.Add(this.force, force);
    };
    this.init = function () {
        this.force.x = 0;
        this.force.y = 0;
    };
    this.simulate = function (dt) { 
        this.vel.x += ((this.force.x / this.m) * dt);
        this.vel.y += ((this.force.y / this.m) * dt);

        this.pos = { x: this.pos.x + this.vel.x * dt, y: this.pos.y + this.vel.y * dt };
    };

    return this;
};


function Spring(mass1, mass2, springConstant, springLength, frictionConstant) {
    this.mass1 = mass1;
    this.mass2 = mass2;
    this.springConstant = springConstant;
    this.springLength = springLength;
    this.frictionConstant = frictionConstant;
    this.lastxx = 0;
    this.lastyy = 0;
    this.tiz = 0;
    this.solve = function () {
         
        var springVector = [mass1.pos.x - mass2.pos.x, mass1.pos.y - mass2.pos.y];
        
        this.lastxx = mass1.pos.x;
        this.lastyy = mass1.pos.y;

        var r = Math.sqrt(springVector[0] * springVector[0] + springVector[1] * springVector[1]);

        var xx = (((((springVector[0] / r) * (r - this.springLength)) * -this.springConstant))) + -((this.mass1.vel.x - this.mass2.vel.x) * this.frictionConstant);
        var yy = (((((springVector[1] / r) * (r - this.springLength)) * -this.springConstant))) + -((this.mass1.vel.y - this.mass2.vel.y) * this.frictionConstant);

        this.mass1.force.x += xx;
        this.mass1.force.y += yy;

        this.mass2.force.x += -xx;
        this.mass2.force.y += -yy;

    };

    return this;
};

function Simulation(numOfMasses, m,
        springC,
        springFrictionConstant,
        gravitation,
        airFrictionConstant, startPos, endPos, render) {
    this.render = render;
    this.remove = false;
    this.numOfMasses = numOfMasses;
    this.masses = [];
    this.endPos = endPos ? endPos : { x: 0, y: 0 };
    var a;
    for (a = 0; a < numOfMasses; ++a) {
        this.masses[a] = new Mass(m);
    }

    this.springConstant = 0.0375 ;
    
    this.getMass = function (index) {
        if (index < 0 || index >= this.numOfMasses)		// if the index is not in the array
            return null; // then return NULL
        return this.masses[index]; // get the mass at the index
    };
    this.init = function () {
        for (var b = 0; b < numOfMasses; ++b)		// We will init() every mass
            this.masses[b].init();
    };
    this.tiz = 0;
    this.skipping = true;
    this.operate = function (dt) {

        var b;



        var xx;
        var yy;

        xx = 0;
        yy = 0;

        for (b = 0; b < this.numOfMasses; ++b) {
            xx += this.masses[b].force.x;
            yy += this.masses[b].force.y;
        }
        if (!this.message[1]) this.message[1] = 0;
        if (!this.message[2]) this.message[2] = 0;
        this.message[0] = "";

        if (yy > -0.005 && yy < 0.0005 && xx > -0.005 && xx < 0.0005 && !this.skipping && (this.startPos.x == this.lastStartPos.x && this.startPos.y == this.lastStartPos.y && this.endPos.x == this.lastEndPos.x && this.endPos.y == this.lastEndPos.y) && this.tiz++ % 6 > 0) {
            this.message[0] = "good";
            this.message[2]++;
            return;
        }
        this.message[1]++;
        this.skipping = false;
 
        this.lastStartPos = this.startPos;
        this.lastEndPos = this.endPos;



        this.init(); // Step 1: reset forces to zero 
        this.solve(); // Step 2: apply forces
        this.simulate(dt);
    };
    this.springs = [];
    this.gravitation = gravitation;
    this.startPos = startPos ? startPos : { x: 0, y: 0 };
    this.ropeConnectionVel = { x: 0, y: 0 };
    this.airFrictionConstant = airFrictionConstant;


    this.springOffset = 0;
    var springLength = (this.springConstant + 0) * Math.sqrt((Math.pow(this.endPos.x - this.startPos.x, 2) + Math.pow(this.endPos.y - this.startPos.y, 2)));
    var resX = (endPos.x - startPos.x) / this.numOfMasses;
    var resY = (endPos.y - startPos.y) / this.numOfMasses;

    for (a = 0; a < this.numOfMasses; ++a) {


        this.masses[a].pos.x = startPos.x + a * resX;
        this.masses[a].pos.y = startPos.y + a * resY;
    }


    for (a = 0; a < this.numOfMasses - 1; ++a) {
        this.springs[a] = new Spring(this.masses[a], this.masses[a + 1],
              springC, springLength, springFrictionConstant);
    }

    this.solve = function () {
        var b;
        for (b = 0; b < this.numOfMasses - 1; ++b) {
            this.springs[b].solve();
        }
        for (b = 0; b < numOfMasses; ++b) {
            var dd = this.masses[b];
            var mc = dd.m;
            dd.force.x += ((this.gravitation.x) * mc);
            dd.force.y += ((this.gravitation.y) * mc);

            dd.force.x += (-dd.vel.x) * this.airFrictionConstant;
            dd.force.y += (-dd.vel.y) * this.airFrictionConstant;
        }
    };

    this.message = [];
    this.lastStartPos = this.startPos;
    this.lastEndPos = this.endPos;

    this.simulate = function (dt) {

        var b;
 



        for (b = 0; b < this.numOfMasses; ++b)
            this.masses[b].simulate(dt);

        var sc = (this.springConstant + this.springOffset) * Math.sqrt((Math.pow(this.endPos.x - this.startPos.x, 2) + Math.pow(this.endPos.y - this.startPos.y, 2)));
        for (b = 0; b < this.numOfMasses - 1; ++b) {
            this.springs[b].springLength = sc;
        }


        this.startPos = Vector2D.Add(this.startPos, Vector2D.Mul(this.ropeConnectionVel, dt)); //iterate the positon of startPos


        this.masses[0].pos = this.startPos; //mass with index "0" shall position at startPos

        this.masses[this.numOfMasses - 1].pos = this.endPos;


    };

    this.tick = function () {
        if (this.remove) {
            clearInterval(this.intervalTick);
            return false;
        }
        for (var b = 0; b < 50; ++b)								// We Need To Iterate Simulations "numOfIterations" Times
            this.operate(0.002);
    };
    if (this.render) {
        this.intervalTick = setInterval(function (th) { th.tick(); }, 40, this);

    }


    this.draw = function (canv) {

        canv.fillStyle = WireColor;
        canv.lineWidth = 2;
        canv.lineJoin = "round";
        canv.strokeStyle = "#333";
        var b;
        for (b = 0; b < this.numOfMasses; ++b) {
            var mass1 = this.getMass(b);
            var pos1 = mass1.pos;


            if (b == 0)
                canv.moveTo(pos1.x, pos1.y);
            else
                canv.lineTo(pos1.x, pos1.y);


        } canv.stroke();



        canv.fillStyle = "#334";
        canv.font = "13pt Arial bold";

        if (DEBUG) {
            for (var i = 0; i < this.message.length; i++) {
                canv.fillText(this.message[i], 150, 150 + i * 30);
            }
        }



    };

    return this;
};


 