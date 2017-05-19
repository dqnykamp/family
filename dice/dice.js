"use strict";

var maxVal = 6;
var A = [[0.0873362445, 0.0436681223, 0.0436681223, 0, 0, 0],
         [0.0436681223, 0, 0.0436681223, 0.0343522562, 0.0435225619, 0],
         [0.0436681223, 0.0436681223, 0.0288209607, 0.0096069869, 0.0343522562, 0],
         [0, 0.0343522562, 0.0096069869, 0.0288209607, 0.0436681223, 0.0436681223],
         [0, 0.0435225619, 0.0343522562, 0.0436681223, 0, 0.0436681223],
         [0, 0, 0, 0.0436681223, 0.0436681223, 0.0873362445]];
var Asum = [0];

for(var i = 0; i<maxVal; i++) {
    for(var j = 0; j<maxVal; j++) {
        Asum.push(Asum[Asum.length-1]+A[i][j]);
    }
}

Asum.shift();
Asum[Asum.length-1]=1;

var n1,n2;

function roll() {
    var d1 = document.getElementById("d1");
    var d2 = document.getElementById("d2");
    var random = Math.random();
    for (var i = 0; i<maxVal*maxVal; i++){
        if(random <= Asum[i]) {
            n1=Math.floor(i/maxVal)+1;
            n2=i % maxVal+1;
            break;
        }
    }
    d1.innerHTML=n1;
    d2.innerHTML=n2;
}