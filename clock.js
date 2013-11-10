
refTime = new Date()
clocks = []

function newClock(el, label, timeOffset) {
 var clock = new Clock(el, label, timeOffset)
 clocks.push(clock)
}

function updateClocks() {
 // update refTime
 refTime = new Date() 
 for (var i = 0; i < clocks.length; i++) {
  clocks[i].updateClock();
 }
 // next refresh in 1 sec
 setTimeout(updateClocks, 1000);
}
updateClocks();

// ========================
// Clock class
// ========================
function Clock(el, l, t){ 
  var div = el, // div container
   width = $("#"+el).width(),
   height = $("#"+el).height(),
   analogWidth = width * 0.6, // analog clock width
   analogStorke = analogWidth * 0.1,
   analogHR = analogWidth/2*1,
   analogMR = (analogWidth/2)*0.7,
   analogSR = (analogWidth/2)*0.4,
   analogPos = [width/2, analogWidth*0.7], // analog clock position
   digitSize = [width/14, width/7], // digit size
   digitPos = [(width-(digitSize[0]*8.2))/2, analogWidth*1.4], // digital clock position
   digitPosOffset = [0,
                     digitSize[0]*1.2,
                     digitSize[0]*3,
                     digitSize[0]*4.2,
                     digitSize[0]*6,
                     digitSize[0]*7.2,
                     digitSize[0]*2.5,
                     digitSize[0]*5.5],
   digitStorke = digitSize[0]/3, // digit storke size
   digitPadding = 1, // digit segment padding
   label = l, // label
   timeOffset = t,
   paper, // SVG paper   
   clockDigits = [], // digits
   lastHours, // track digit changes
   arcH, arcM, arcS, // analog clock arcs
   lastMinutes; // track digit changes

  this.initialize = function(){
    // create Raphael SVG paper
    paper = Raphael(div, 0, 0);
    // debug bgcolor
    // rect = paper.rect(0, 0, width, height)
    // rect.attr("fill", "#f00")
    // add custom attribute for drawing arcs
    paper.customAttributes.arc = function (xloc, yloc, value, total, R) {
      if (value==0) { value = 0.01 }   
      var alpha = 360 / total * (total-value),
          a = (alpha) * Math.PI / 180,
          dx = -R * Math.sin(a),
          dy = -R * Math.cos(a) + R,
          path,
          largeArcFlag = 1,
          sweepFlag = 0;
      // hanlde 0 and angle<180
      if (alpha < 180 ) { largeArcFlag = 0; }
      // update path 
      path = [
        ["M", xloc, yloc - R],
        // a rx ry x-axis-rotation large-arc-flag sweep-flag x y)
        ["a", R, R, 0, largeArcFlag, sweepFlag, dx ,dy]
      ];
      //
      return {
          path: path
      };
    };
    // label
    paper.text(width*0.8, digitPos[1]+digitSize[1]*1.3, label).attr({ "fill": "#A1C8DA",  "text-anchor": "end", "font-size": Math.round(digitSize[1]/3)+"px"});
    // clocks
    this.initAnalogClock();
    this.initDigitalClock();
  }

  // start updating clock each sec.
  this.start = function() {
    updateClock()
  }

  // create clock
  this.initAnalogClock = function() {
    arcH = paper.path().attr({ "stroke": "#A1C8DA", "stroke-width": analogStorke, arc: [analogPos[0], analogPos[1], 0, 100, analogHR] });
    arcM = paper.path().attr({ "stroke": "#6D9C9C", "stroke-width": analogStorke, arc: [analogPos[0], analogPos[1], 0, 100, analogMR] });
    arcS = paper.path().attr({ "stroke": "#CDE4E4", "stroke-width": analogStorke, arc: [analogPos[0], analogPos[1], 0, 100, analogSR] });
  }

  this.initDigitalClock = function() {
    var oX = digitPos[0], oY = digitPos[1], bgcolor = "#051D25", fgcolor = "#B3DAE8"
    // digit background
    this.createDigit(oX+digitPosOffset[0], oY, bgcolor)
    this.createDigit(oX+digitPosOffset[1], oY, bgcolor)
    this.createDigit(oX+digitPosOffset[2], oY, bgcolor)
    this.createDigit(oX+digitPosOffset[3], oY, bgcolor)
    this.createDigit(oX+digitPosOffset[4], oY, bgcolor)
    this.createDigit(oX+digitPosOffset[5], oY, bgcolor)
    // digit foreground
    clockDigits[0] = this.createDigit(oX+digitPosOffset[0], oY, fgcolor)
    clockDigits[1] = this.createDigit(oX+digitPosOffset[1], oY, fgcolor)
    clockDigits[2] = this.createDigit(oX+digitPosOffset[2], oY, fgcolor)
    clockDigits[3] = this.createDigit(oX+digitPosOffset[3], oY, fgcolor)
    clockDigits[4] = this.createDigit(oX+digitPosOffset[4], oY, fgcolor)
    clockDigits[5] = this.createDigit(oX+digitPosOffset[5], oY, fgcolor)
    clockDigits[6] = this.createColon(oX+digitPosOffset[6], oY, fgcolor)
    clockDigits[7] = this.createColon(oX+digitPosOffset[7], oY, fgcolor)
  }

  // create 7 segments digit
  this.createDigit = function(x, y, color) {
    var w = digitSize[0], h = digitSize[1], 
      H=h/2, p = digitPadding, s = digitStorke, S=s/2, Ss = S/2, 
      segments = []
    segments[0] = paper.path("M"+(x+p)+" "+y+"L"+(x+w-p)+" "+y+"L"+(x+w-p-S)+" "+(y+S)+"L"+(x+p+S)+" "+(y+S)).attr({ "stroke": color, "stroke-width": 0, "fill": color });
    segments[1] = paper.path("M"+x+" "+(y+p)+"L"+(x+S)+" "+(y+p+S)+"L"+(x+S)+" "+(y+H-S-p)+"L"+x+" "+(y+H-p)).attr({ "stroke": color, "stroke-width": 0, "fill": color });
    segments[2] = paper.path("M"+(x+w)+" "+(y+p)+"L"+(x+w-S)+" "+(y+p+S)+"L"+(x+w-S)+" "+(y+H-S-p)+"L"+(x+w)+" "+(y+H-p)).attr({ "stroke": color, "stroke-width": 0, "fill": color });
    segments[3] = paper.path("M"+(x+p)+" "+(y+H)+"L"+(x+p+Ss)+" "+(y+H-Ss)+"L"+(x+w-p-Ss)+" "+(y+H-Ss)+"L"+(x+w-p)+" "+(y+H)+"L"+(x+w-p-Ss)+" "+(y+H+Ss)+"L"+(x+p+Ss)+" "+(y+H+Ss)).attr({ "stroke": color, "stroke-width": 0, "fill": color });
    segments[4] = paper.path("M"+x+" "+(y+H+p)+"L"+(x+S)+" "+(y+H+p+S)+"L"+(x+S)+" "+(y+h-S-p)+"L"+x+" "+(y+h-p)).attr({ "stroke": color, "stroke-width": 0, "fill":color });
    segments[5] = paper.path("M"+(x+w)+" "+(y+H+p)+"L"+(x+w-S)+" "+(y+H+p+S)+"L"+(x+w-S)+" "+(y+h-S-p)+"L"+(x+w)+" "+(y+h-p)).attr({ "stroke": color, "stroke-width": 0, "fill":color });
    segments[6] = paper.path("M"+(x+p)+" "+(y+h)+"L"+(x+w-p)+" "+(y+h)+"L"+(x+w-p-S)+" "+(y+h-S)+"L"+(x+p+S)+" "+(y+h-S)).attr({ "stroke": color, "stroke-width": 0, "fill":color });
    return segments; 
  }

  // create digital colon char
  this.createColon = function(x, y, color) {
    var w = digitSize[0], h = digitSize[1], s = digitStorke/2, segments = []
    segments[0] = paper.rect(x,y+h/3,s,s).attr({ "stroke": color, "stroke-width": 0, "fill": color });
    segments[1] = paper.rect(x,y+h*0.8,s,s).attr({ "stroke": color, "stroke-width": 0, "fill": color });
    return segments; 
  }
  
  this.updateClock = function() {
   // get time values
   var d = refTime
   // offset
   var utc = d.getTime() + (d.getTimezoneOffset() * 60000);
   var time = new Date(utc + (3600000*timeOffset));
   // digits
   var hours   = time.getHours()
   var minutes = time.getMinutes()
   var seconds = time.getSeconds()
   var millis  = time.getMilliseconds()
   // update UI
   if ( lastHours != hours ) {
    updateDigit(clockDigits[0], Math.floor(hours / 10))
    updateDigit(clockDigits[1], Math.floor(hours % 10))
    arcH.stop()
    arcH.animate({ arc: [analogPos[0], analogPos[1], hours % 12, 12, analogHR] }, 1000, "=");
    //arcH.attr({ arc: [analogPos[0], analogPos[1], hours % 12, 12, analogHR] });
   }
   if ( lastMinutes != minutes ) {
    updateDigit(clockDigits[2], Math.floor(minutes / 10))
    updateDigit(clockDigits[3], Math.floor(minutes % 10))
    arcM.stop()
    arcM.animate({ arc: [analogPos[0], analogPos[1], minutes, 60, analogMR] }, 1000, "=");
    //arcM.attr({ arc: [analogPos[0], analogPos[1], minutes, 60, analogMR] });
   }
   lastMinutes=minutes;
   lastHours=hours;
   updateDigit(clockDigits[4], Math.floor(seconds / 10))
   updateDigit(clockDigits[5], Math.floor(seconds % 10))
   arcS.stop()
   if (seconds == 0) {
    arcS.attr({ arc: [analogPos[0], analogPos[1], seconds, 60, analogSR] });
   } else {
    arcS.animate({ arc: [analogPos[0], analogPos[1], seconds, 60, analogSR] }, 1000, "=");
   }
  }

  var updateDigit = function(segments, nbr) {
    if (nbr == 0) {
     updateSegments(segments, [1, 1, 1, 0, 1, 1, 1])
    } else if (nbr == 1) {
     updateSegments(segments, [0, 0, 1, 0, 0, 1, 0])
    } else if (nbr == 2) {
     updateSegments(segments, [1, 0, 1, 1, 1, 0, 1])
    } else if (nbr == 3) {
     updateSegments(segments, [1, 0, 1, 1, 0, 1, 1])
    } else if (nbr == 4) {
     updateSegments(segments, [0, 1, 1, 1, 0, 1, 0])
    } else if (nbr == 5) {
     updateSegments(segments, [1, 1, 0, 1, 0, 1, 1])
    } else if (nbr == 6) {
     updateSegments(segments, [1, 1, 0, 1, 1, 1, 1])
    } else if (nbr == 7) {
     updateSegments(segments, [1, 0, 1, 0, 0, 1, 0])
    } else if (nbr == 8) {
     updateSegments(segments, [1, 1, 1, 1, 1, 1, 1])
    } else if (nbr == 9) {
     updateSegments(segments, [1, 1, 1, 1, 0, 1, 1])
    }
  }

  var updateSegments = function(segments, arr) {
   for(i = 0; i< 7; i++) {
    if (arr[i] == 0) {
     segments[i].stop()
     segments[i].animate({ opacity : 0/*, blur : 2*/  }, 500, function () { this.hide() });
     //segments[i].hide() 
    } else {
     segments[i].stop()
     segments[i].show().animate({ opacity : 1/*, blur : 0*/ }, 10);
     //segments[i].show()
    }
   }
  }

  this.initialize();
}











