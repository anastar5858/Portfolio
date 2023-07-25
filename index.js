// array holding the color of each circle segment and the message 
let colorMsg = [{
    color: "rgb(238, 130, 238)",
    msg: "Hobbies",
}, {
    color: "rgb(60, 179, 113)",
    msg: "Movies",
}, {
    color: "rgb(255, 165, 0)",
    msg: "Books",
}]

// variable for smoothening the spinning effect
let counterSpin = 0

// where the removed segments would go from color msg
let removedSegments = [];

// the circle class
class Circle {
    // constructor function with
    // the center of the canvas horizontal position
    // the center of the canvas vertical position
    // the required radius of the circle
    constructor(centerX, centerY, radius) {
        this.x = centerX;
        this.y = centerY;
        this.r = radius;
    }
    // the method for drawing the circle
    // optional parameter angle used for animation (spinning)
    drawCircle(ctx, angle) {
        // each segment angle in degrees
        let segmentAngle = 360 / colorMsg.length;
        // the mid angle value added to the starting angle
        // to give the mid angle
        let segmentMidAdd = segmentAngle / 2
        // the starting angle of the segment
        // will be zero if no animation is used
        let segment = angle !== undefined ? angle : 0;
        // for loop repeated to construct each segment
        for (let i = 0; i < colorMsg.length; i++) {
            // draw circle segments
            let start = segment;
            // start drawing (corresponding to a pen on a canvas)
            ctx.beginPath();
            // the ending segment (will be added to the current start)
            // to give the next start
            let ending = segment + segmentAngle * (Math.PI / 180)
            // draw the arc
            ctx.arc(this.x, this.y, this.r, start, ending)
            // draw a line to the center
            ctx.lineTo(this.x, this.y)
            // segment now becomes the ending
            segment = ending
            // fill with the color from the array and add an outline (stroke)
            ctx.fillStyle = colorMsg[i].color;
            ctx.fill()
            ctx.stroke()
            // draw the text
            // get the segment by adding the start to the mid of each segment value
            const centerSegment = start + segmentMidAdd * (Math.PI / 180);
            // get the center x and y coordinate
            // multiply by radius because the result withou
            // multiplying is defined by the unit circle (radius of 1)
            const centerSegmentX = this.x + (Math.cos(centerSegment) * this.r /1.5);
            const centerSegmentY = this.y + (Math.sin(centerSegment) * this.r /1.5);
            // save the state of the canvas (because we will change the rotation axis)
            ctx.save()
            // make the canvas translate to the middle of the segment (now it is also the rotation axis)
            ctx.translate(centerSegmentX, centerSegmentY)
            // scale so that the text appers human readable (mirror effect)
            ctx.scale(1, -1);
            ctx.scale(-1, 1);
            // rotate around the new origin
            ctx.rotate(centerSegment)
            // add the text 
            // note that x and y coordinates are 0,0
            // because we are already at the positioning place
            ctx.font = "10px Arial";
            ctx.fillStyle = 'black';
            ctx.fillText(colorMsg[i].msg, 0, 0);
            // restore the canvas to avoid undesired effects for the next segment construction
            ctx.restore();
        }
    }

    // the function responsible for removing a segment
    // by placing it from the coloMsg array to the removed segments array
    removeSegment(ctx, stopping, w, h, circle) {
        // the stopping point
        const stopInRads = stopping * (Math.PI / 180)
        // get the x and y coordinate of the stopping angle of the spinner
        // this is used to find the color at that point
        const x = (w / 2) + (circle.r / 1.5) * Math.cos(stopInRads);
        const y = (h / 2) + (circle.r / 1.5) * Math.sin(stopInRads);
        // Get the color of the pixel at the specified position
        const imageData = ctx.getImageData(x, y, 1, 1);
        const color = `rgb(${imageData.data[0]}, ${imageData.data[1]}, ${imageData.data[2]})`;
        // search for the desired segment to be removed based
        // on the color where the spinner has stopped
        const index = colorMsg.map((obj, i) => {
            if (obj.color === color) {
                return i;
            }
        }).filter(item => item !== undefined)
        // add it to removed segments and remove it drom colormsg
        const futureRemovedSegment = colorMsg[index[0]];
        colorMsg.splice(index[0], 1) 
        removedSegments.push(futureRemovedSegment)
        // redraw the circle without the segment
        this.drawCircle(ctx)
        this.drawSpinner(ctx)
        // bring in the data 
        prepareTemplate(futureRemovedSegment.msg)
        // if all segments have been removed reinitialise the process
        if (colorMsg.length === 0) {
            colorMsg = [...removedSegments];
            removedSegments = [];
            this.drawCircle(ctx)
            this.drawSpinner(ctx)
        }
    }

    // the function responsible for drawing the spinner
    drawSpinner(ctx, angle, stopping, animate, w, h, circle) {
        // we have rotated to the stopping angle
        if (animate && angle > stopping) {
             // after some time start removing the segment and stopping the animation
             // as well as bringing the data by calling 
             // prepareTemplate from removeSegment
             setTimeout(() => {
                this.removeSegment(ctx, stopping, w, h, circle)
                counterSpin = 0
            }, 1000 * 2)
            return
        }
        // if we are animating i.e., request animation frame
        // provided the boolean animate as a paramter
        // we animate the circle as well
        if (animate) {
            ctx.clearRect(0, 0, w, h);
            this.drawCircle(ctx, counterSpin);
            counterSpin += 0.05;
        }
        // save the state of the canvas
        // as we will again change the axis of rotation
        ctx.save()
        ctx.beginPath();
        // translate to the middle of the canvas to be the axis of rotation
        // instead of the entire canvas
        ctx.translate(this.x, this.y)
        // rotate the spinner slightly 
        // if not animating the angle is 0
        // if animating the angle is increased before
        // each frame request with the if statement
        // at the end of this funciton
        ctx.rotate(angle * (Math.PI / 180))
        // move slightly to the right
        // so that the spinner start at angle 0
        // important so that it follows the normal 
        // rotation angles
        ctx.moveTo(0 + 35, 0)
        // draw the circle of the spinner
        ctx.arc(0, 0,20, 90 * (Math.PI / 180), 280* (Math.PI / 180), false)
        // move again from the end to create that triangular head
        ctx.moveTo(0 + 35, 0)
        // place the text
        ctx.fillStyle = 'black';
        ctx.fill()
        ctx.stroke()
        ctx.font = "10px Arial";
        ctx.fillStyle = 'white';
        ctx.fillText("spin", 0 - 7.5, 0);
        // restore the canvas state
        ctx.restore()
        // only if animating increase the angle and request the next available frame
        if (animate) {
            angle++
            requestAnimationFrame(() => this.drawSpinner(ctx, angle, stopping, animate, w, h, circle))
        }
    }
}

// the function to initiate the animation process
function animationHandler(e, circle) {
    // canvas in 2d and mid points
    const canvas = e.target;
    const ctx = canvas.getContext('2d');
    const canvasHCenter = canvas.width/2;
    const canvasVCenter = canvas.height/2
    // check if we clciked on spinner
    // based on the mouse location at the time
    // the event was executed relative to the canvas
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    // if it is in the right position start animating
    if ((mouseX > canvasHCenter - 20 && mouseX < canvasHCenter + 20) && (mouseY > canvasVCenter - 20 && mouseY < canvasVCenter + 20)) {
        const stoppingAngle = Math.floor(Math.random() * 320);
        requestAnimationFrame(() => circle.drawSpinner(ctx, 0, stoppingAngle, true, canvas.width, canvas.height, circle))
    }
}

// function executed when redraw is requested
function redrawDefault(ctx, circle, w, h) {
    colorMsg = [...colorMsg, ...removedSegments];
    removedSegments = [];
    ctx.clearRect(0, 0, w, h);
    circle.drawCircle(ctx);
    circle.drawSpinner(ctx)
}

// the main function executed when the script is loaded
function startDrawing() {
    // bring the canvas in 2d and get the mid points
    const canvas = document.getElementById('spinningWheel');
    const ctx = canvas.getContext('2d');
    const canvasHCenter = canvas.width/2;
    const canvasVCenter = canvas.height/2
    // create the circle instance
    const circle = new Circle(canvasHCenter, canvasVCenter, 110);
    // draw the circle and spinner initially
    circle.drawCircle(ctx);
    circle.drawSpinner(ctx)
    // add the click event listener to start the animation based on the logic
    canvas.addEventListener('click', (e) => animationHandler(e, circle))
    // grab the redraw button and add the click event to redraw the circle upon user request
    const redrawBtn = document.getElementById('redrawCircle');
    redrawBtn.addEventListener('click', (e) => redrawDefault(ctx, circle, canvas.width, canvas.height))
}

startDrawing()
// topic title page function --->
// the function repsonsible for bringing the initial topic details
function prepareTemplate(title) {
    // get the top template (the picture and h1 and back button)
    const templateTop = document.getElementById('topicPageTitleTemp');
    const allCardsCon = document.createElement('div');
    // add the class and id for css manipulation
    allCardsCon.classList.add('topicCardContainer')
    allCardsCon.id = 'topicCardContainer'
    let data = null;
    // clone the top area
    let clon = templateTop.content.cloneNode(true);
    // handle each data accurately
    // for each topic fill in the required data from the files
    // then append the top area to the body
    // and place each card of each topic segment to 
    // the container created above allCardsCon
    data = dataFile[`${title.toLowerCase()}Data`];
    clon.getElementById('topicWall').src = `./images/Topics wallpapers/${title.toLowerCase()}.png`
    clon.getElementById('topicTitle').textContent = title
    document.body.appendChild(clon)
    document.body.appendChild(allCardsCon)
    animatedDataCards(data, allCardsCon)
    // make the home page dissapeara and add the event tp bring it back on clicking on the back button
    document.getElementById('backToWheel').addEventListener('click', () => returnWheel())
    document.getElementById('fullBioPage').style.display = 'none'
}



let done = false;
let count = 50;
function animatedDataCards(data, allCardsCon) {
    data.forEach((element) => {
        // console.log('should be printed 5 times', element)
        requestAnimationFrame(() => {
           generateDataCards(element, allCardsCon)
        })
    });
}

function generateDataCards(element, allCardsCon) {
    // console.log('next start', count, element, done)
    // for each card requestanimation frame
    // if (done === true) {
    //     return
    //   }
      // only display card once
    if (count === 50 && done === true) {
            const dataType = element[Object.keys(element)[0]];
            const templateCard = document.getElementById('topicPageCardTemp');
            const cardClone = templateCard.content.cloneNode(true);
            cardClone.getElementById('cardTopicTitle').textContent = dataType;
            cardClone.getElementById('cardTopicDesc').textContent = element.text;
            cardClone.getElementById('additionalBtn').id = cardClone.getElementById('additionalBtn').id + `data${dataType}`;
            allCardsCon.appendChild(cardClone) 
            done = false 
            return  
    }
    // to do the next card
    if (count === 0) {
        done = true;
        count = 50;
    } else count--
    requestAnimationFrame(() => generateDataCards(element, allCardsCon))
}


// functions for unfolding the mask
const maskImage = document.getElementById('hackMask');
let opacity = 1;
let requestId;

function decreaseOpacity() {
  opacity -= 0.01;
  if (opacity < 0) {
    opacity = 0;
    cancelAnimationFrame(requestId);
  } else {
    maskImage.style.opacity = opacity;
    requestId = requestAnimationFrame(decreaseOpacity);
  }
}

function increaseOpacity() {
  opacity += 0.01;
  if (opacity > 1) {
    opacity = 1;
    cancelAnimationFrame(requestId);
  } else {
    maskImage.style.opacity = opacity;
    requestId = requestAnimationFrame(increaseOpacity);
  }
}

maskImage.addEventListener('mouseover', () => {
  requestId = requestAnimationFrame(decreaseOpacity);
});

maskImage.addEventListener('mouseout', () => {
  requestId = requestAnimationFrame(increaseOpacity);
});

// function to bring the home page back and clean the topic page resources
function returnWheel() {
    // remove other page resources
    const pageTopicTitle = document.getElementById('mainImgCon')
    const pageTopicDesc = document.getElementsByClassName('topicCardCon');
    const allCardsCon = document.getElementById('topicCardContainer')
    if (pageTopicTitle) {
        document.body.removeChild(pageTopicTitle)
    }
    if (pageTopicDesc.length > 0) {
        for (let i = pageTopicDesc.length - 1; i >= 0; i--) {
            allCardsCon.removeChild(pageTopicDesc[i]);
        }
        document.body.removeChild(allCardsCon);
    }
    // bring the wheel home component back
    document.getElementById('fullBioPage').style.display = 'block'
}