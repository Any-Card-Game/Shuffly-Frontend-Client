
var WireColor = "rgb(255,255,255)";


function UIArea(x, y, w, h) {
    this.x = x;
    this.y = y;
    this.width = w;
    this.height = h;
    this.textAreas = [];
    this.buttons = [];
    this.dragging = false;

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
    this.click = function (e) {
        e.x -= this.x;
        e.y -= this.y;
        for (var ij = 0; ij < this.buttons.length; ij++) {
            var button = this.buttons[ij];
            if (this.y + button.y <= e.y && this.y + button.y + button.height > e.y && this.x + button.x <= e.x && this.x + button.x + button.width > e.x) {
               
                button.Clicking = true;
                button.Click();
                return e.preventDefault() && false;
            }
        }
        this.dragging = { x: e.x - this.x, y: e.y - this.y };

        return e.preventDefault() && false;
    };

    this.mouseMove = function (e) { 
        if (!this.dragging) return;
         
        e.x -= this.dragging.x;
        e.y -= this.dragging.y;

        this.x = e.x;
        this.y = e.y;




    };
    this.mouseUp = function (e) {
        
        e.x -= x;
        e.y -= y;
        for (var ij = 0; ij < this.buttons.length; ij++) {
            var button = this.buttons[ij];
            button.Clicking = false;

        }
        this.dragging = false;

    };
    this.scroll = function (e) {
        e.x -= this.x;
        e.y -= this.y;


    };
    this.draw = function (canv) {



        canv.fillStyle = WireColor;
        canv.lineWidth = 2;
        canv.strokeStyle = "#333";
        roundRect(canv, this.x, this.y, this.width, this.height, 5, true, true);


        for (var j = 0; j < this.textAreas.length; j++) {
            var t = this.textAreas[j];
            canv.fillStyle = t.color;
            canv.font = t.font;
            canv.fillText(t.text, this.x + t.x, this.y + t.y);

        }
        var ij;

        for (ij = 0; ij < this.buttons.length; ij++) {
            var button = this.buttons[ij];


            canv.fillStyle = button.Color;
            roundRect(canv, this.x + button.x, this.y + button.y, button.width, button.height, 5, true, true);
            canv.fillStyle = button.Clicking ? "#FCA" : "#334";
            canv.font = "13pt Arial bold";
            canv.fillText(button.text, this.x + button.x + (button.width / 4), this.y + button.y + (button.height / 3) * 2);
        }
    };

    return this;
}


function TextArea(x, y, text, font, color) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.font = font;
    this.color = color;


    return this;
};
