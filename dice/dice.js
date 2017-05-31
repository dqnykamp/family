define(['div', 'jquery', 'jsxgraph'], function(div, $, JXG) {

"use strict";

var $div = $(div);
var d1 = $('<span id="d1"/>');
var d2 = $('<span id="d2"/>');
var d1Div = $('<div class="die" style="color:Red"/>');
var d2Div = $('<div class="die" style="color:Blue"/>');
d1Div.appendTo($div);
d1.appendTo(d1Div);
d2Div.appendTo($div);
d2.appendTo(d2Div);

var buttonDiv = $('<div class="buttons"/>');
buttonDiv.append($('<button>Roll!</button>').click(function () {roll();}));
buttonDiv.append($('<button>Roll 10 times!</button>').click(function () {roll(10);}));
buttonDiv.append($('<button>Roll 100 times!</button>').click(function () {roll(100);}));
buttonDiv.appendTo($div);
    
buttonDiv.append("<br/>")
buttonDiv.append($('<button>Reset</button>').click(function () {reset();}));

var toggleButton = $('<button id="toggle">Show fractions</button>').click(toggleAxis);
toggleButton.appendTo(buttonDiv);

$('<div class="buttons"><br/></div><div id="box1" class="jxgbox" style="width:200px; height:200px; display:inline-block;"></div><div id="box2" class="jxgbox" style="width:200px; height:200px; display:inline-block;"></div><div id="box3" class="jxgbox" style="width:400px; height:200px;"></div>').appendTo($div);
    
JXG.Options.board.ShowCopyright=false;
JXG.Options.axis.ticks.majorHeight=20;

var yHighBuffer = 1.4;
var yLowBuffer = -0.3;


var board1 = JXG.JSXGraph.initBoard('box1', {boundingbox: [-1, yHighBuffer, 7, yLowBuffer], axis:false, showNavigation:false, pan:{enabled:false}});
var board2 = JXG.JSXGraph.initBoard('box2', {boundingbox: [-1, yHighBuffer, 7, yLowBuffer], axis:false, showNavigation:false, pan:{enabled:false}});
var board3 = JXG.JSXGraph.initBoard('box3', {boundingbox: [-1, yHighBuffer, 13, yLowBuffer], axis:false, showNavigation:false, pan:{enabled:false}});

var xax1 = board1.create('axis', [[0, 0], [1, 0]], {straightFirst: false, name:"Number", withLabel:true, label:{position:"top", offset:[-10,-20]}, ticks:{label:{offset:[-4,-9]}}});
var yax1 = board1.create('axis', [[0, 0], [0, 1]], {straightFirst: false, name:"Count", withLabel:true, label:{position:"top"}});
var xax2 = board2.create('axis', [[0, 0], [1, 0]], {straightFirst: false, name:"Number", withLabel:true, label:{position:"top", offset:[-10,-20]}, ticks:{label:{offset:[-4,-9]}}});
var yax2 = board2.create('axis', [[0, 0], [0, 1]], {straightFirst: false});
var xax3 = board3.create('axis', [[0, 0], [1, 0]], {straightFirst: false, name:"Sum", withLabel:true, label:{position:"top", offset:[-10,-20]}, ticks:{label:{offset:[-4,-9]}}});
var yax3 = board3.create('axis', [[0, 0], [0, 1]], {straightFirst: false});

var trot = board1.create('transform', [Math.PI/2, 1, 2], {type:"rotate"});
trot.bindTo(yax1.label);

console.log(yax1.label);

var maxVal = 6;

var historyRed;
var historyBlue;
var historySum;

var f_historyRed;
var f_historyBlue;
var f_historySum;

var nRolls;

reset();

var showCounts=true;

var s2 = 0.082, s3 = 0.084, s4 = 0.089, s5 = 0.09, s6 = 0.1;
var p22 = 0.05, p23 = 0.035, p33 = 0.06, p34 = 0.03;

var s7 = 1 - 2*(s2 + s3 + s4 + s5 + s6);
var r1 = s2/2+s7/4+1/12;
var r2 = -s3/2 - s6/2 + 1/6;
var p24 = p22/2 - p33 - p34 + r1 - r2;
var p25 = -p22 - p23 + p33/2 + r2;

var p11 = s2;
var p12 = s3/2;
var p13 = s4/2-p22/2;
var p14 = s5/2-p23;
var p15 = s6/2-p24-p33/2;
var p16 = s7/2-p34-p25;

var A = [[p11, p12, p13, p14, p15, p16],
         [p12, p22, p23, p24, p25, p15],
         [p13, p23, p33, p34, p24, p14],
         [p14, p24, p34, p33, p23, p13],
         [p15, p25, p24, p23, p22, p12],
         [p16, p15, p14, p13, p12, p11]];

var Asum = [0];

for(var i = 0; i<maxVal; i++) {
    for(var j = 0; j<maxVal; j++) {
        Asum.push(Asum[Asum.length-1]+A[i][j]);
    }
}

Asum.shift();
Asum[Asum.length-1]=1;

var n1,n2;

console.log(A);

function roll(n) {
    if (n === undefined) {
        n = 1;
    }
    
    for (var j = 0; j<n; j++){
        var random = Math.random();
        for (var i = 0; i<maxVal*maxVal; i++){
            if(random <= Asum[i]) {
                n1=Math.floor(i/maxVal)+1;
                n2=i % maxVal+1;
                break;
            }
        }
        
        historyRed[n1-1]+=1;
        historyBlue[n2-1]+=1;
        historySum[n1+n2-1]+=1;
        nRolls+=1;
    }
    
    d1.html(n1);
    d2.html(n2);
    
    resizeBoards();
    
    board1.update();
    board2.update();
    board3.update();
}

var chartR = board1.create('chart', [f_historyRed],{chartStyle:'bar', width:0.9, color:"red"});
var chartB = board2.create('chart', [f_historyBlue],{chartStyle:'bar', width:0.9, color:"blue"});
var chartS = board3.create('chart', [f_historySum],{chartStyle:'bar', width:0.9, color:"purple"});

function reset() {

    historyRed = [];
    historyBlue = [];
    historySum = [];
    f_historyRed = [];
    f_historyBlue = [];
    f_historySum = [];
    nRolls = 1;
    
    for(var i = 0; i<maxVal; i++) {
        historyRed.push(0);
        historyBlue.push(0);
        (function () {
            var j=i;    
            f_historyRed.push(function(){if(showCounts){return historyRed[j];}else{return historyRed[j]/nRolls;}});
            f_historyBlue.push(function(){if(showCounts){return historyBlue[j];}else{return historyBlue[j]/nRolls;}});
        })();
    }

    for (var i = 0; i<2*maxVal; i++) {
        historySum.push(0);
        (function () {
            var j=i;    
            f_historySum.push(function(){if(showCounts){return historySum[j];}else{return historySum[j]/nRolls;}});
        })();
    }
    
    board1.update();
    board2.update();
    board3.update();
    
    nRolls = 0;
    
    resizeBoards();
    
    d1.html("");
    d2.html("");
}

function toggleAxis() {
    showCounts = !showCounts;
    if(showCounts){
        toggleButton.html("Show fractions");
    } else {
        toggleButton.html("Show counts");
    }
    resizeBoards();
}

function resizeBoards() {
    if (nRolls==0) {
        board1.setBoundingBox([-1, yHighBuffer, 7, yLowBuffer]);
        board2.setBoundingBox([-1, yHighBuffer, 7, yLowBuffer]);
        board3.setBoundingBox([-1, yHighBuffer, 13, yLowBuffer]);
    }
    else {
        var yMax1 = 0;
        var yMax2 = 0;
        for(var i = 0; i<maxVal; i++) {
            yMax1=Math.max(yMax1,f_historyRed[i]());
            yMax2=Math.max(yMax2,f_historyBlue[i]());
        }

        board1.setBoundingBox([-1, yHighBuffer*yMax1, 7, yLowBuffer*yMax1]);
        board2.setBoundingBox([-1, yHighBuffer*yMax2, 7, yLowBuffer*yMax2]);

        yMax1 = 0;
        for(var i = 1; i<2*maxVal; i++) {
            yMax1=Math.max(yMax1,f_historySum[i]());
        }
        board3.setBoundingBox([-1, yHighBuffer*yMax1, 13, yLowBuffer*yMax1]);
    }
}

});