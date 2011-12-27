


function randColor() {
    return "rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")";
}

function Lights(canvasName) {
    var that = this;
    that.Wires = [];
    that.UIAreas = [];

    this.canvas = $("#" + canvasName);
    this.canvasItem = document.getElementById(canvasName).getContext("2d");




    this.canvasWidth = 0;
    this.canvasHeight = 0;



    function addEmptyWire(color) {
        that.Wires.push({ Lights: [], State: true, Color: color });
    }


    addEmptyWire(randColor());

    var area = new UIArea(40, 40, 250, 220);
    that.UIAreas.push(area);
    area.textAreas.push(new TextArea(25, 50, "Hi", "15pt Arial bold","blue"));
    area.buttons.push({ x: 50, y: 50, width: 120, height: 22, Clicking: false, text: "New Wire", Click: function () { addEmptyWire("rgb(" + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + "," + Math.floor(Math.random() * 255) + ")"); }, Color: "rgb(50,150,50)" });

    var btn;var intv;
    area.buttons.push(btn = { x: 30, y: 150, width: 180, height: 22, Clicking: false, text: "Start Random", Click: function () {
        if (btn.text == "Start Random") {
            btn.text = "Stop Random";
            intv = setInterval(tick3, 250);
        } else {
            btn.text = "Start Random";
            clearInterval(intv);
        }
    }, Color: "rgb(50,150,50)"
    });

    function getCursorPosition(event) {
        if (event.targetTouches) event = event.targetTouches[0];

        var x;
        var y;
        if (event.pageX != null && event.pageY != null) return that.last = { x: event.pageX, y: event.pageY };
        var element = (!document.compatMode || document.compatMode == 'CSS1Compat') ? document.documentElement : document.body;

        return that.last = { x: event.clientX + element.scrollLeft, y: event.clientY + element.scrollTop };
    }

    function addLight(x, y, skip) {

        for (var j = 0; j < that.Wires.length; j++) {
            var g = that.Wires[j].Lights;
            for (var i = 0; i < g.length; i++) {
                if (inBounds(x, y, g[i].x, g[i].y)) {
                    if (skip) {
                        return;
                    }
                    mouseOffset = { x: x - g[i].x, y: y - g[i].y };
                    g[i].moving = true;
                    return;
                }
            }
        }

        var fc = that.Wires[that.Wires.length - 1].Lights;
        var light;
        fc.push(light = { x: x, y: y, RopeSimulations: [] });

        if (fc.length > 1) {
            light.RopeSimulations.push(addRopeSim({ x: fc[fc.length - 1].x, y: fc[fc.length - 1].y }, { x: fc[fc.length - 2].x, y: fc[fc.length - 2].y }, false));
            fc[fc.length - 2].RopeSimulations.push(addRopeSim({ x: fc[fc.length - 2].x, y: fc[fc.length - 2].y }, { x: fc[fc.length - 1].x, y: fc[fc.length - 1].y }, true));
        }
        else {
            light.RopeSimulations.push(null);
        }

    }
    function inBounds(x1, y1, x2, y2) {

        if (x1 > x2 - Light.W && x1 < x2 + Light.W &&
            y1 > y2 - 5 && y1 < y2 + Light.H)
            return true;
        return false;
    }
    function removeLight(x, y) {

        for (var j = 0; j < that.Wires.length; j++) {
            var nI = 0;
            var g = that.Wires[j].Lights;
            var removed = false;
            for (var i = 0; i < g.length; i++) {
                if (inBounds(x, y, g[i].x, g[i].y)) {
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
                g[nI - 1].RopeSimulations.push(addRopeSim({ x: g[nI - 1].x, y: g[nI - 1].y }, { x: g[nI + 1].x, y: g[nI + 1].y }, true));
                g[nI + 1].RopeSimulations[0] = addRopeSim({ x: g[nI + 1].x, y: g[nI + 1].y }, { x: g[nI - 1].x, y: g[nI - 1].y }, false);

                that.Wires[j].Lights.splice(nI, 1);
                return;
            }
        }


    }

    function addRopeSim(startPos, endPos, render) {
        return new Simulation(
                60, // 80 Particles (Masses)
                0.05, // Each Particle Has A Weight Of 50 Grams
                10000.0, // springConstant In The Rope 
                1.7, // Spring Inner Friction Constant
                {x: 0, y: 9.81 * 1499 }, // Gravitational Acceleration
                0.9, // Air Friction Constant
                startPos, endPos, render);
    }

    function canvasOnClick(e) {
        var cell = getCursorPosition(e);


        for (var ij = 0; ij < that.UIAreas.length; ij++) {
            var are = that.UIAreas[ij];
            if (are.y <= cell.y && are.y + are.height > cell.y && are.x <= cell.x && are.x + are.width > cell.x) {
                return are.click(e);
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
    var mouseOffset = { x: 0, y: 0 };
    function canvasMouseMove(e) {
        e.preventDefault();
        var cell = getCursorPosition(e);

        for (var ij = 0; ij < that.UIAreas.length; ij++) {
            var are = that.UIAreas[ij];
            if (are.y <= cell.y &&
                    are.y + are.height > cell.y &&
                        are.x <= cell.x && 
                            are.x + are.width > cell.x) {
                return are.mouseMove(cell);
            }
        }
        
        
        cell.x -= mouseOffset.x;
        cell.y -= mouseOffset.y;
        for (var j = 0; j < that.Wires.length; j++) {
            var g = that.Wires[j].Lights;
            for (var i = 0; i < g.length; i++) {
                if (g[i].moving) {
                    if (i == 0) {
                        if (g[i].RopeSimulations.length > 1) {
                            g[i].RopeSimulations[1].startPos = { x: cell.x, y: cell.y };
                        }
                    } else if (i == g.length - 1) {
                        g[i].RopeSimulations[0].startPos = { x: cell.x, y: cell.y };
                        g[i - 1].RopeSimulations[1].endPos = { x: cell.x, y: cell.y };
                    }
                    else {
                        if (g[i].RopeSimulations.length > 1) {
                            g[i].RopeSimulations[1].startPos = { x: cell.x, y: cell.y };
                        }
                        g[i].RopeSimulations[0].endPos = { x: cell.x, y: cell.y };


                        g[i - 1].RopeSimulations[1].endPos = { x: cell.x, y: cell.y };
                        g[i + 1].RopeSimulations[0].startPos = { x: cell.x, y: cell.y };


                    }
                    that.draw();
                    g[i].x = cell.x;
                    g[i].y = cell.y;

                    return false;
                }
            }
        }
        return false;

    }
    function canvasMouseUp(e) {
        mouseOffset = { x: 0, y: 0 };
        var cell = getCursorPosition(e);


        for (var j = 0; j < that.Wires.length; j++) {
            var g = that.Wires[j].Lights;
            for (var i = 0; i < g.length; i++) {
                if (inBounds(cell.x, cell.y, g[i].x, g[i].y, 12)) {
                    g[i].moving = false;
                    return;
                }
            }
        }



        for (var ij = 0; ij < that.UIAreas.length; ij++) {
            var area = that.UIAreas[ij];
            area.mouseUp(e);
        }

    }


    var handleScroll = function (evt) {
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;


        for (var ij = 0; ij < that.UIAreas.length; ij++) {
            var are = that.UIAreas[ij];
            if (are.y <= evt.y && are.y + are.height > evt.y && are.y <= evt.x && are.y + are.width > evt.x) {
                return are.scroll(evt);
            }
        }
        
        
        for (var j = 0; j < that.Wires.length; j++) {
            for (var k = 0; k < that.Wires[j].Lights.length; k++) {
                for (var l = 0; l < that.Wires[j].Lights[k].RopeSimulations.length; l++) {
                    var fc = that.Wires[j].Lights[k].RopeSimulations[l];
                    if (fc) {
                        fc.springOffset += delta > 0 ? 0.0003 : -0.0003;
                        for (var i = 0; i < fc.masses.length; i++) {
                            fc.getMass(i).applyForce({ x: 0, y: 50 });
                        }
                        fc.skipping = true;
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

        var ij;
        for (ij = 0; ij < that.Wires.length; ij++) {
            var wire = that.Wires[ij];
            var ic;

            for (ic = 0; ic < wire.Lights.length; ic++) {
                var light = wire.Lights[ic];

                if (light.RopeSimulations.length > 1) {
                    light.RopeSimulations[1].draw(that.canvasItem);
                }


                that.canvasItem.fillStyle = (light.moving ? "rgb(17,95,200)" : (wire.State ? wire.Color : Grey));
                that.canvasItem.strokeStyle = "#FF0";


                that.canvasItem.beginPath();
                that.canvasItem.moveTo(light.x, light.y);
                that.canvasItem.bezierCurveTo(light.x - Light.W, light.y + Light.H, light.x + Light.W, light.y + Light.H, light.x + 1, light.y + 1);
                that.canvasItem.fill();
                that.canvasItem.stroke();
            }
        }

        for (ij = 0; ij < that.UIAreas.length; ij++) {
            var are = that.UIAreas[ij];
            are.draw(that.canvasItem);
        }   
    };


    
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

        addLight(50 + (Math.random() * (that.canvasWidth - 100)), 50 + (Math.random() * (that.canvasHeight - 100)), true);
        if (Math.random() * 30 < 5) {
            addEmptyWire(randColor());
        }
    }
    setInterval(tick2, 1000);
 

};
 