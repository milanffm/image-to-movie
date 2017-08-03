/**
 * Controller for the chapters
 *
 * @returns {Function}
 */

"use strict";

var SpriteAnim = require('sprite-anim');

function startAnimation (){
    var element = document.querySelector('.animation');
    var renderer = new SpriteAnim.DOMRenderer(element);
    var parser = new SpriteAnim.SimpleParser(
        {width: 1680, height: 3384},
        {width: 210, height: 423}
        );
    var options = {
        frameRate: 25,
        loop: true
    };

    var anim = new SpriteAnim(parser, renderer, options);
    anim.play();
}


module.exports = {



    init: function () {
        console.log('animation CONTROLLER ')

        startAnimation();
    }
};

