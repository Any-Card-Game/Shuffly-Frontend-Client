$(function () {
    paper = Raphael("spokeBuilder");

    box = paper.rect(470, 100, 240, 240);
    box.attr({ 'stroke-width': 4 });
    box.attr({ stroke: 'green' });
    box.attr({ fill: 'red' });
    points = [];
    line = paper.path('');
    line.attr({ 'stroke-width': 2 });
    line.attr({ stroke: 'green' });
    line.insertAfter(box);

    box.click(function (ev) {
        circ = paper.circle(ev.x, ev.y, 9);
        circ.attr({ 'stroke-width': 2 });
        circ.attr({ stroke: 'green' });
        circ.attr({ fill: 'lightblue' });
        circ.drag(function (dx, dy) {

            this.attr({
                cx: this.ox + dx,
                cy: this.oy + dy
            });

            redrawPath();
        }, function () {
            this.ox = this.attr("cx");
            this.oy = this.attr("cy");

            this.attr({ fill: 'blue' });

        }, function () {
            this.attr({ fill: 'lightblue' });
        });
        points.push(circ);
        redrawPath();
    });

    redrawPath = function () {
        myPath = '';
        if (points.length > 1) {
            myPath = 'M' + points[0].attr('cx') + ',' + points[0].attr('cy');
            for (jj = 1; jj < points.length; jj++) {
                myPath += 'L' + points[jj].attr('cx') + ',' + points[jj].attr('cy');
            }
        }
        line.attr({ path: myPath });
    }

});

function SpokeEngine() {




    this.showPile = function (cards, left, top, scale, bend, maxWidth, dragStartEffects, dragEndEffects) {
        /*
        cards={
        cardIndex:0
        effects:[{
        type:'rect',
        effectWidth:0,
        attributes:[{
        type:'color','opactiy','rotation','location',
        color:'black',
        amount:0,
        x:0,
        y:0,

        animate:false,
        length:0,
        extra:'bounce',
        removeOnFinish:false
        }]
                    
        }]
        */
        var maxAngleVariation = 0;
        var angleIncrease = 0;
        var startAngle = 0;

        if (bend) {
            maxAngleVariation = 22;
            angleIncrease = (maxAngleVariation * 2) / (cards.length - 1);
            startAngle = -maxAngleVariation;
        }



        for (var i = 0; i < dragStartEffects.length; i++) {
            dragStartEffects[i].attributes['rotation'] = 0;
        }
        dragStartEffects.push({ type: 'original', attributes: { rotation: 0} });
        dragEndEffects.push({ type: 'original', attributes: { startRotation: true} });


        dragStartEffects.push({ type: 'original', attributes: { rotation: 0} });
        dragEndEffects.push({ type: 'original', attributes: { startRotation: true} });




        for (var zs in cards) {
            var card = cards[zs];
            card.effects.push({ type: 'original', attributes: { startRotation: true} });

            var c = paper.image("assets/cards/1" + card.cardIndex + ".gif", left, top + Math.abs(startAngle), 71, 96);
            c.scale(scale);

            c.ox = c.attr("x");
            c.oy = c.attr("y");

            c.STARTANGLE = startAngle;
            c.STARTX = c.attr('x');
            c.STARTY = c.attr('y');

            c.effects = [];


            for (ia = 0; ia < card.effects.length; ia++) {
                ef = card.effects[ia];
                drawEffectOnCard(ef, c);
            }

            var start = function () {
                if (this.isMoving) {
                    return false;
                }

                this.isMoving = true;

                this.animate({
                    rotation: 0
                }, 700, ">");

                for (var i = 0; i < dragStartEffects.length; i++) {
                    effect = drawEffectOnCard(dragStartEffects[i], this);
                }

            },
        move = function (dx, dy) {
            // move will be called with dx and dy 
            this.attr({
                x: this.ox + dx,
                y: this.oy + dy
            });
            for (ind = 0; ind < this.effects.length; ind++) {
                this.effects[ind].attr({
                    x: this.ox + dx - this.effects[ind].effectWidth,
                    y: this.oy + dy - this.effects[ind].effectWidth
                });
            }
        },
        up = function () {
            a = this;
            this.animate({
                x: this.ox,
                y: this.oy,
                rotation: this.STARTANGLE
            }, 700, ">", function () {
                a.isMoving = false;
            });


            for (ia = 0; ia < card.effects.length; ia++) {

                ef = card.effects[ia];
                drawEffectOnCard(ef, c);
            }

            for (ind = 0; ind < dragEndEffects.length; ind++) {
                this.effects[card.effects.length + ind].animate({
                    x: this.ox - this.effects[ind].OFFSET,
                    y: this.oy - this.effects[ind].OFFSET
                }, 700, ">", function () { });

                effect = drawEffectOnCard(dragEndEffects[ind], this, this.effects[card.effects.length + ind]);
            }

        };

            c.drag(move, start, up);
            startAngle += angleIncrease;
            left = left + maxWidth / cards.length;
        }
    }


    return this;
}


function drawEffectOnCard(effect, card, original) {
    switch (ef.type.toLowerCase()) {
        case 'rect':
            if (!original) {
                original = paper.rect(card.ox - effect.effectWidth, card.oy - effect.effectWidth, card.attr("width") + effect.effectWidth * 2, card.attr("height") + effect.effectWidth * 2, effect.effectWidth);

                card.effects.push(original);
                original.toBack();
            }
            break;

        case 'original':
            if (!original) {
                original = card;
            }
            break;
    }


    if (effect.attributes) {
        for (var i = 0; i < effect.attributes.length; i++) {
            at = effect.attributes[i];
            options = {};
            options['rotation'] = card.STARTANGLE;
            switch (at.type.toLowerCase()) {
                case 'color':
                    options['fill'] = effect.color;
                    break;
                case 'opacity':
                    options['opacity'] = effect.amount;
                    break;
                case 'rotation':
                    options['rotation'] = card.STARTANGLE + effect.amount;
                    break;
                case 'startRotation':
                    options['rotation'] = card.STARTANGLE;
                    break;
                case 'location':
                    options['x'] = at.x;
                    options['y'] = at.y;
                    break;
            }

            if (at.animate) {
                original.animate(options, at.length, at.extra, at.removeOnFinish);
            } else {
                original.attr(options);
            }

        }
    }

}

function drawText(x, y, size, string, attr) {
    var txt = paper.print(10, 50, "print", r.getFont(string))
    if (attr) txt.attr(attr);

}
