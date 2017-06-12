define(['div', 'jquery', 'jsxgraph', 'db'], function(div, $, JXG, db) {
"use strict";
    
var maxVal = 6;
    
var f_historyRed, f_historyBlue, f_historySum;
var historyRed, historyBlue, historySum;

var $div = $(div);
var d1, d2, tRcounts, tRfracs, tBcounts, tBfracs, tScounts, tSfracs;
var toggleButton;

var yHighBuffer = 1.4;
var yLowBuffer = -0.3;

var board1, board2, board3;
    
var Asum;
    
var a,b;
    
db.on("reset", function (){
    var nRolls = 0;
    historyRed = [];
    historyBlue = [];
    historySum = [];
    

    var i;
    
    for(i = 0; i<maxVal; i++) {
        historyRed.push(0);
        historyBlue.push(0);
    }

    for (i = 0; i<2*maxVal; i++) {
        historySum.push(0);
    }
    assign_db_from_vars();
    
    db.nRolls=nRolls;
    db.showCounts=false;
    db.n1="";
    db.n2="";
    
    setupChartFunctions ();

});

if (!db.historyRed || db.historyRed.length != maxVal) {
    db.clear();
}
else {
    historyRed=db.historyRed;
    historyBlue=db.historyBlue;
    historySum=db.historySum;
    
    setupChartFunctions();
}

function assign_vars_from_db() {
    if(!db.nRolls || !db.historyRed || !db.historyBlue || !db.historySum || db.historyRed.length != maxVal || db.historyBlue.length != maxVal || db.historySum.length != 2*maxVal) {
        reset();
    }
    else {
        historyRed = db.historyRed;
        historyBlue = db.historyBlue;
        historySum = db.historySum;
    }
    
}
   
function assign_db_from_vars() {
    [db.historyRed, db.historyBlue, db.historySum] = [historyRed, historyBlue, historySum];
    
}
    
function setupChartFunctions () {
    
    var i;
    f_historyRed = [];
    f_historyBlue = [];
    f_historySum = [];
    for(i = 0; i<maxVal; i++) {
        (function () {
            var j=i;    
            f_historyRed.push(function(){if(db.showCounts){return historyRed[j];}else{return historyRed[j]/Math.max(1,db.nRolls);}});
            f_historyBlue.push(function(){if(db.showCounts){return historyBlue[j];}else{return historyBlue[j]/Math.max(1,db.nRolls);}});
        })();

    }

    for (i = 0; i<2*maxVal; i++) {
        (function () {
            var j=i;    
            f_historySum.push(function(){if(db.showCounts){return historySum[j];}else{return historySum[j]/Math.max(1,db.nRolls);}});
            })();
    }
}

function setupHTML () {
    d1 = $('<span id="d1"/>');
    d2 = $('<span id="d2"/>');
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
    buttonDiv.append($('<button>Roll 10000 times!</button>').click(function () {roll(10000);}));
    buttonDiv.appendTo($div);

    buttonDiv.append("<br/>")
    buttonDiv.append($('<button>Reset</button>').click(function () {db.clear();}));

    toggleButton = $('<button id="toggle">Show fractions</button>').click(function (){db.showCounts= !db.showCounts;});
    toggleButton.appendTo(buttonDiv);

    $('<div id="box1" class="jxgbox" style="width:200px; height:200px; display:inline-block; border:none;"></div><div id="box2" class="jxgbox" style="width:200px; height:200px; display:inline-block; border:none;"></div><div id="box3" class="jxgbox" style="width:400px; height:200px; border:none;"></div>').appendTo($div);

    var tR = $('<table class="countChart"/>');
    var tRr1 = $('<tr></tr>');
    var tRr2 = $('<tr></tr>');
    var tRr3 = $('<tr></tr>');
    var tB = $('<table class="countChart"/>');
    var tBr1 = $('<tr></tr>');
    var tBr2 = $('<tr></tr>');
    var tBr3 = $('<tr></tr>');
    tRr1.append('<th>Red</th>');
    tRr2.append('<th>Count</th>');
    tRr3.append('<th>Fraction</th>');
    tBr1.append('<th>Blue</th>');
    tBr2.append('<th>Count</th>');
    tBr3.append('<th>Fraction</th>');
    tRcounts = [];
    tRfracs = [];
    tBcounts = [];
    tBfracs = [];
    for(var i = 0; i<maxVal; i++){
        tRcounts.push($('<td></td>'));
        tRfracs.push($('<td></td>'));
        tRr1.append('<th>'+(i+1)+'</th>');
        tRr2.append(tRcounts[i]);
        tRr3.append(tRfracs[i]);
        tBcounts.push($('<td></td>'));
        tBfracs.push($('<td></td>'));
        tBr1.append('<th>'+(i+1)+'</th>');
        tBr2.append(tBcounts[i]);
        tBr3.append(tBfracs[i]);
    }
    tRr1.append('<th>total</th>');
    tRcounts.push($('<th></th>'));
    tRr2.append(tRcounts[maxVal]);
    tRr3.append('<th>1</th>');
    tR.append($('<thead/>').append(tRr1));
    tR.append($('<tbody>').append(tRr2).append(tRr3));
    tR.appendTo($div);

    tBr1.append('<th>total</th>');
    tBcounts.push($('<th>0</th>'));
    tBr2.append(tBcounts[maxVal]);
    tBr3.append('<th>1</th>');
    tB.append($('<thead/>').append(tBr1));
    tB.append($('<tbody>').append(tBr2).append(tBr3));
    tB.appendTo($div);
    
    var tS = $('<table class="countChart" style="width: 600px"/>');
    var tSr1 = $('<tr></tr>');
    var tSr2 = $('<tr></tr>');
    var tSr3 = $('<tr></tr>');
    tSr1.append('<th>Sum</th>');
    tSr2.append('<th>Count</th>');
    tSr3.append('<th>Fraction</th>');
    tScounts = [];
    tSfracs = [];
    
    for(var i = 0; i<2*maxVal; i++){
        tScounts.push($('<td></td>'));
        tSfracs.push($('<td></td>'));
        tSr1.append('<th>'+(i+1)+'</th>');
        tSr2.append(tScounts[i]);
        tSr3.append(tSfracs[i]);
    }
    
    tSr1.append('<th>total</th>');
    tScounts.push($('<th></th>'));
    tSr2.append(tScounts[2*maxVal]);
    tSr3.append('<th>1</th>');
    tS.append($('<thead/>').append(tSr1));
    tS.append($('<tbody>').append(tSr2).append(tSr3));
    tS.appendTo($div);
}

function setupJSX () {
    JXG.Options.board.ShowCopyright=false;
    JXG.Options.axis.ticks.majorHeight=20;

    board1 = JXG.JSXGraph.initBoard('box1', {boundingbox: [-1, yHighBuffer, 7, yLowBuffer], axis:false, showNavigation:false, pan:{enabled:false}});
    board2 = JXG.JSXGraph.initBoard('box2', {boundingbox: [-1, yHighBuffer, 7, yLowBuffer], axis:false, showNavigation:false, pan:{enabled:false}});
    board3 = JXG.JSXGraph.initBoard('box3', {boundingbox: [-1, yHighBuffer, 13, yLowBuffer], axis:false, showNavigation:false, pan:{enabled:false}});

    var xax1 = board1.create('axis', [[0, 0], [1, 0]], {straightFirst: false, name:"Number", withLabel:true, label:{position:"top", offset:[-10,-20]}, ticks:{label:{offset:[-4,-9]}}});
    var yax1 = board1.create('axis', [[0, 0], [0, 1]], {straightFirst: false, name:"Count", withLabel:true, label:{position:"top"}});
    var xax2 = board2.create('axis', [[0, 0], [1, 0]], {straightFirst: false, name:"Number", withLabel:true, label:{position:"top", offset:[-10,-20]}, ticks:{label:{offset:[-4,-9]}}});
    var yax2 = board2.create('axis', [[0, 0], [0, 1]], {straightFirst: false});
    var xax3 = board3.create('axis', [[0, 0], [1, 0]], {straightFirst: false, name:"Sum", withLabel:true, label:{position:"top", offset:[-10,-20]}, ticks:{label:{offset:[-4,-9]}}});
    var yax3 = board3.create('axis', [[0, 0], [0, 1]], {straightFirst: false});

    //var trot = board1.create('transform', [Math.PI/2, 1, 2], {type:"rotate"});
    //trot.bindTo(yax1.label);

    var chartR = board1.create('chart', [f_historyRed],{chartStyle:'bar', width:0.9, color:"red"});
    var chartB = board2.create('chart', [f_historyBlue],{chartStyle:'bar', width:0.9, color:"blue"});
    var chartS = board3.create('chart', [f_historySum],{chartStyle:'bar', width:0.9, color:"purple"});
}
    
function setupProbability () {
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

    Asum = [0];

    for(var i = 0; i<maxVal; i++) {
        for(var j = 0; j<maxVal; j++) {
            Asum.push(Asum[Asum.length-1]+A[i][j]);
        }
    }

    Asum.shift();
    Asum[Asum.length-1]=1;

}

setupHTML();
setupJSX();
setupProbability();
    
db.on("change", function (){
    
    historyRed=db.historyRed;
    historyBlue=db.historyBlue;
    historySum=db.historySum;

    d1.html(db.n1);
    d2.html(db.n2);
    
    if(!historyRed || !historyBlue || !historySum || historyRed.length != maxVal || historyBlue.length != maxVal || historySum.length != 2*maxVal) {
        return;
    }
    
    if(db.showCounts){
        toggleButton.html("Show fractions");
    } else {
        toggleButton.html("Show counts");
    }
    resizeBoards();
    
    board1.update();
    board2.update();
    board3.update();
    
    for(var i = 0; i<maxVal; i++) {
        tRcounts[i].html(db.historyRed[i]);
        tBcounts[i].html(db.historyBlue[i]);
        if (db.nRolls == 0) {
            tRfracs[i].html("");
            tBfracs[i].html("");
        } else {
            tRfracs[i].html((db.historyRed[i]/db.nRolls).toFixed(3));
            tBfracs[i].html((db.historyBlue[i]/db.nRolls).toFixed(3));
        }
    }
    tRcounts[maxVal].html(db.nRolls);
    tBcounts[maxVal].html(db.nRolls);
    
    for(var i = 0; i<2*maxVal; i++) {
        tScounts[i].html(db.historySum[i]);
        if (db.nRolls == 0) {
            tSfracs[i].html("");
        } else {
            tSfracs[i].html((db.historySum[i]/db.nRolls).toFixed(3));
        }
    }
    tScounts[2*maxVal].html(db.nRolls);
});
    
function roll(n) {
    if (n === undefined) {
        n = 1;
    }
    var n1, n2, nRolls=db.nRolls;
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

    assign_db_from_vars();
    db.nRolls=nRolls;
    db.n1 = n1;
    db.n2 = n2;
    
}

function resizeBoards() {
    if (db.nRolls==0) {
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

/*function old_roll(n) {
    if (n === undefined) {
        n = 1;
    }
    
    for (var j = 0; j<n; j++){
        var random = Math.random();
        for (var i = 0; i<maxVal*maxVal; i++){
            if(random <= Asum[i]) {
                db.n1=Math.floor(i/maxVal)+1;
                db.n2=i % maxVal+1;
                break;
            }
        }
        
        historyRed[db.n1-1]+=1;
        historyBlue[db.n2-1]+=1;
        historySum[db.n1+db.n2-1]+=1;
        nRolls+=1;
    }
    
    d1.html(db.n1);
    d2.html(db.n2);
    
    resizeBoards();
    
    board1.update();
    board2.update();
    board3.update();
    
    for(var i = 0; i<maxVal; i++) {
        tRcounts[i].html(historyRed[i]);
        tRfracs[i].html((historyRed[i]/nRolls).toFixed(3));
        tBcounts[i].html(historyBlue[i]);
        tBfracs[i].html((historyBlue[i]/nRolls).toFixed(3));
    }
    tRcounts[maxVal].html(nRolls);
    tBcounts[maxVal].html(nRolls);
}
    
function old_reset() {

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
    
    nRolls = 0;
    
    board1.update();
    board2.update();
    board3.update();
    
    for(var i = 0; i<maxVal; i++) {
        tRcounts[i].html(0);
        tRfracs[i].html("");
        tBcounts[i].html(0);
        tBfracs[i].html("");
    }
    tRcounts[maxVal].html(0);
    tBcounts[maxVal].html(0);
    

    
    resizeBoards();
    
    d1.html("");
    d2.html("");
}
    
function toggleAxis_old() {
    showCounts = !showCounts;
    if(showCounts){
        toggleButton.html("Show fractions");
    } else {
        toggleButton.html("Show counts");
    }
    resizeBoards();
}*/

});