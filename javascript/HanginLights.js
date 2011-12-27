


function randColor() {
    return "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";
}

function Lights(canvasName) {
    var that = this;
    that.Wires = [];
    that.Buttons = [];

    this.canvas = $("#" + canvasName);
    this.canvasItem = document.getElementById(canvasName).getContext("2d");




    this.canvasWidth = 0;
    this.canvasHeight = 0;



    function addEmptyWire(color) {
        that.Wires.push({ Lights: [], State: true, Color: color });
    }


    addEmptyWire(randColor());
    that.Buttons.push({ X: 50, Y: 50, Width: 120, Height: 22, Clicking: false, Text: "New Wire", Click: function () { addEmptyWire("rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")"); }, Color: "rgb(50,150,50)" });

    function getCursorPosition(event) {
        if (event.targetTouches) event = event.targetTouches[0];

        var x;
        var y;
        if (event.pageX != null && event.pageY != null) return that.last = { x: event.pageX, y: event.pageY };
        var element = (!document.compatMode || document.compatMode == 'CSS1Compat') ? document.documentElement : document.body;

        return that.last = { x: event.clientX + element.scrollLeft, y: event.clientY + element.scrollTop };
    }

    function addLight(x, y) {

        for (var j = 0; j < that.Wires.length; j++) {
            var g = that.Wires[j].Lights;
            for (var i = 0; i < g.length; i++) {
                if (inBounds(x, y, g[i].X, g[i].Y)) {
                    g[i].moving = true;
                    return;
                }
            }
        }

        var fc = that.Wires[that.Wires.length - 1].Lights;
        var light;
        fc.push(light = { X: x, Y: y, RopeSimulations: [] });

        if (fc.length > 1) {
            light.RopeSimulations.push(addRopeSim({x: fc[fc.length - 1].X, y: fc[fc.length - 1].Y }, { x: fc[fc.length - 2].X, y: fc[fc.length - 2].Y }, false));
            fc[fc.length - 2].RopeSimulations.push(addRopeSim({x: fc[fc.length - 2].X, y: fc[fc.length - 2].Y }, { x: fc[fc.length - 1].X, y: fc[fc.length - 1].Y },true));
        }
        else {
            light.RopeSimulations.push(null);
        }

    }
    function inBounds(x1, y1, x2, y2) {

        if (x1 > x2 - Light.W && x1 < x2 + Light.W &&
            y1 > y2-5  && y1 < y2 + Light.H)
            return true;
        return false;
    }
    function removeLight(x, y) {

        for (var j = 0; j < that.Wires.length; j++) {
            var nI = 0;
            var g = that.Wires[j].Lights;
            var removed = false;
            for (var i = 0; i < g.length; i++) {
                if (inBounds(x, y, g[i].X, g[i].Y)) {
                    for (var k = 0; k < g[i - 1].RopeSimulations.length; k++) {
                        if (g[i].RopeSimulations[k])
                            g[i].RopeSimulations[k].remove = true;
                    }
                    if (i > 0) {
                        if (i == that.Wires[j].Lights.length - 1) {
                            g[i - 1].RopeSimulations[1].remove = true;
                            g[i - 1].RopeSimulations.splice(1, 1);
                            that.Wires[j].Lights.splice(i, 1);
                            
                            return;
                        } else {

                            g[i - 1].RopeSimulations[1].remove = true;
                            g[i + 1].RopeSimulations[0].remove = true;


                            g[i - 1].RopeSimulations.splice(1, 1);
                            g[i].RopeSimulations.splice(0, 1);
                            nI = i;
                            removed = true;
                        }
                    } else {
                        g[i + 1].RopeSimulations[0].remove = true;
                        g[i].RopeSimulations.splice(0, 1);
                        that.Wires[j].Lights.splice(i, 1);
                        return;
                    }

                }
            }


            if (removed) {
                g[nI - 1].RopeSimulations.push(addRopeSim({x: g[nI - 1].X, y: g[nI - 1].Y }, { x: g[nI + 1].X, y: g[nI + 1].Y },true));
                g[nI + 1].RopeSimulations[0] = addRopeSim({x: g[nI + 1].X, y: g[nI + 1].Y }, { x: g[nI - 1].X, y: g[nI - 1].Y }, false);

                that.Wires[j].Lights.splice(nI, 1);
                return;
            }
        }


    }
    
    function addRopeSim(startPos,endPos,render) {
     return   new Simulation(
                30, // 80 Particles (Masses)
                0.05, // Each Particle Has A Weight Of 50 Grams
                10000.0, // springConstant In The Rope 
                1.7, // Spring Inner Friction Constant
                {x: 0, y: 9.81 * 1499 }, // Gravitational Acceleration
                0.9, // Air Friction Constant
                startPos, endPos, render); 
    }

    function canvasOnClick(e) {
        var cell = getCursorPosition(e);
        for (var ij = 0; ij < that.Buttons.length; ij++) {
            var button = that.Buttons[ij];
            if (button.Y <= cell.y && button.Y + button.Height > cell.y && button.X <= cell.x && button.X + button.Width > cell.x) {
                button.Clicking = true;
                button.Click();
                return e.preventDefault() && false;
            }
        }
        if (e.shiftKey) {
            removeLight(cell.x, cell.y);

        } else if (e.button == 0) {
            addLight(cell.x, cell.y);
        }

        return e.preventDefault() && false;
    }

    function stringify(obj, cc) {
        if (cc > 0) return "";
        if (!cc) cc = 0;
        var t = typeof (obj);
        if (t != "object" || obj === null) {
            // simple data type
            if (t == "string") obj = '"' + obj + '"';
            return String(obj);
        }
        else {
            // recurse array or object
            var n, v, json = [], arr = (obj && obj.constructor == Array);
            for (n in obj) {
                v = obj[n]; t = typeof (v);
                if (t == "string") v = '"' + v + '"';
                else if (t == "object" && v !== null) v = stringify(v, cc + 1);
                json.push((arr ? "" : '"' + n + '":') + String(v));
            }
            return (arr ? "[" : "{") + String(json) + (arr ? "]" : "}");
        }
    };
    function canvasMouseMove(e) {
        e.preventDefault();
        var cell = getCursorPosition(e);

        for (var j = 0; j < that.Wires.length; j++) {
            var g = that.Wires[j].Lights;
            for (var i = 0; i < g.length; i++) {
                if (g[i].moving) {
                    if (i == 0) {
                        if (g[i].RopeSimulations.length > 1) {
                            g[i].RopeSimulations[1].startPos = { x: cell.x, y: cell.y };
                        }
                    } else if (i == g.length - 1) {
                        g[i ].RopeSimulations[0].startPos = { x: cell.x, y: cell.y };
                        g[i - 1].RopeSimulations[1].endPos = { x: cell.x, y: cell.y };
                    }
                    else {
                        if (g[i].RopeSimulations.length > 1) {
                            g[i].RopeSimulations[1].startPos = { x: cell.x, y: cell.y };
                        }
                        g[i].RopeSimulations[0].endPos = { x: cell.x, y: cell.y };


                        g[i-1].RopeSimulations[1].endPos = { x: cell.x, y: cell.y };
                        g[i+1].RopeSimulations[0].startPos = { x: cell.x, y: cell.y };


                    }
                    that.draw();
                    g[i].X = cell.x;
                    g[i].Y = cell.y;
                    
                    return;
                }
            }
        }


    }
    function canvasMouseUp(e) {

        var cell = getCursorPosition(e);


        for (var j = 0; j < that.Wires.length; j++) {
            var g = that.Wires[j].Lights;
            for (var i = 0; i < g.length; i++) {
                if (inBounds(cell.x, cell.y, g[i].X, g[i].Y, 12)) {
                    g[i].moving = false;
                    return;
                }
            }
        }



        for (var ij = 0; ij < that.Buttons.length; ij++) {
            var button = that.Buttons[ij];
            button.Clicking = false;

        }

    }


    var handleScroll = function (evt) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        for (var j = 0; j < that.Wires.length; j++) {
            for (var k = 0; k < that.Wires[j].Lights.length; k++) {
                for (var l = 0; l < that.Wires[j].Lights[k].RopeSimulations.length; l++) {
                    if(that.Wires[j].Lights[k].RopeSimulations[l]) {
                        that.Wires[j].Lights[k].RopeSimulations[l].springOffset += delta > 0 ? 0.0001 : -0.0001;
                    }
                }
            }
        }

        return evt.preventDefault() && false;
    };


    document.getElementById(canvasName).addEventListener('DOMMouseScroll', handleScroll, false);
    document.getElementById(canvasName).addEventListener('mousewheel', handleScroll, false);

    document.getElementById(canvasName).addEventListener('touchmove', canvasMouseMove);
    document.getElementById(canvasName).addEventListener('touchstart', canvasOnClick);
    document.getElementById(canvasName).addEventListener('touchend', canvasMouseUp);

    document.getElementById(canvasName).addEventListener('mousedown', canvasOnClick);
    document.getElementById(canvasName).addEventListener('mouseup', canvasMouseUp);
    document.getElementById(canvasName).addEventListener('mousemove', canvasMouseMove);



    that.resizeCanvas = function () {
        that.canvasWidth = $(window).width();
        that.canvasHeight = $(window).height();

        that.canvas.attr("width", that.canvasWidth);
        that.canvas.attr("height", that.canvasHeight);
    };

    var Grey = "rgb(199,199,199)";
    var Light = { W: 17, H: 45 };
    that.draw = function () {
        that.canvasItem.fillStyle = "lightgrey";
        that.canvasItem.fillRect(0, 0, that.canvasWidth, that.canvasHeight);

        that.canvasItem.fillStyle = "red";
        that.canvasItem.font = "23pt Arial";

        /*if (that.last)
        that.canvasItem.fillText(that.last.x + " " + that.last.y, 100, 65);
        if (that.draggingNode)
        that.canvasItem.fillText(that.draggingNode, 100, 95);*/
        var ij;
        for (ij = 0; ij < that.Wires.length; ij++) {
            var wire = that.Wires[ij];


            var ic;

            for (ic = 0; ic < wire.Lights.length; ic++) {
                var light = wire.Lights[ic];

                if (light.RopeSimulations.length > 1) {
                    light.RopeSimulations[1].draw(that.canvasItem);
                }

                that.canvasItem.lineWidth = 0;
                that.canvasItem.lineJoin = "";
                that.canvasItem.strokeStyle = "#000";

                that.canvasItem.fillStyle = (light.moving ? "rgb(17,95,200)" : (wire.State ? wire.Color : Grey));
                that.canvasItem.beginPath();
                 

                that.canvasItem.beginPath();
                that.canvasItem.moveTo(light.X, light.Y);
                that.canvasItem.bezierCurveTo(light.X - Light.W, light.Y + Light.H, light.X + Light.W, light.Y + Light.H, light.X+1, light.Y+1);
                that.canvasItem.stroke();
                that.canvasItem.fill();  
            }
        }

        for (ij = 0; ij < that.Buttons.length; ij++) {
            var button = that.Buttons[ij];



            that.canvasItem.fillStyle = button.Color;
            roundRect(that.canvasItem, button.X, button.Y, button.Width, button.Height, 5, true, true);
            that.canvasItem.fillStyle = button.Clicking ? "#FCA" : "#334";
            that.canvasItem.font = "13pt Arial bold";
            that.canvasItem.fillText(button.Text, button.X + (button.Width / 4), button.Y + (button.Height / 3) * 2);
        }
    };


    /**
    * Draws a rounded rectangle using the current state of the canvas. 
    * If you omit the last three params, it will draw a rectangle 
    * outline with a 5 pixel border radius 
    * @param {CanvasRenderingContext2D} ctx
    * @param {Number} x The top left x coordinate
    * @param {Number} y The top left y coordinate 
    * @param {Number} width The width of the rectangle 
    * @param {Number} height The height of the rectangle
    * @param {Number} radius The corner radius. Defaults to 5;
    * @param {Boolean} fill Whether to fill the rectangle. Defaults to false.
    * @param {Boolean} stroke Whether to stroke the rectangle. Defaults to true.
    */
    function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
        if (typeof stroke == "undefined") {
            stroke = true;
        }
        if (typeof radius === "undefined") {
            radius = 5;
        }
        ctx.beginPath();
        ctx.moveTo(x + radius, y);
        ctx.lineTo(x + width - radius, y);
        ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
        ctx.lineTo(x + width, y + height - radius);
        ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
        ctx.lineTo(x + radius, y + height);
        ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
        ctx.lineTo(x, y + radius);
        ctx.quadraticCurveTo(x, y, x + radius, y);
        ctx.closePath();
        if (stroke) {
            ctx.stroke();
        }
        if (fill) {
            ctx.fill();
        }
    }


    $(window).resize(this.resizeCanvas);
    this.resizeCanvas();
    setInterval(this.draw, 10);

    function tick2() {

        for (var ij = 0; ij < that.Wires.length; ij++) {
            var wire = that.Wires[ij];
            wire.State = !wire.State;
        }
    }
    function tick3() {

        addLight(Math.random() * that.canvasWidth, Math.random() * that.canvasHeight);
        if(Math.random()*30<5) {
            addEmptyWire(randColor());
        }
    }
    setInterval(tick2, 1000);
    setInterval(tick3, 500);

};
 