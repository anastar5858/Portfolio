// array holding the color of each circle segment and the message 
let innerHTMLBackup;
let animationLock = false;
let capturedHeight = false;
let height;
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
    if (animationLock) {
        return
    }
    animationLock = true;
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
    // fix the photos problem of height
    const photoDiv = document.getElementById('photoSec');
    const childElements = photoDiv.querySelectorAll('p, img');
    let maxChildHeight = 0;
    childElements.forEach((element) => {
    maxChildHeight+=element.offsetHeight;
    });
    photoDiv.style.height = `${maxChildHeight}px`;
    fixLayout();
}
// topic title page function ---------------------------->
// the function repsonsible for bringing the initial topic details
function prepareTemplate(title) {
    animationLock = false;
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
    innerHTMLBackup = document.getElementById('mainBioPage').innerHTML;
    document.getElementById('mainBioPage').innerHTML = ''
    document.getElementById('mainBioPage').appendChild(clon)
    document.getElementById('mainBioPage').appendChild(allCardsCon)
    animatedDataCards(data, allCardsCon, title)
    // make the home page dissapeara and add the event tp bring it back on clicking on the back button
    document.getElementById('backToWheel').addEventListener('click', () => returnWheel())
}
let done = false;
let count = 50;
function animatedDataCards(data, allCardsCon, title) {
    data.forEach((element) => {
        requestAnimationFrame(() => {
           generateDataCards(element, allCardsCon, title)
        })
    });
}
function generateDataCards(element, allCardsCon, title) {
    // only display card once
    if (count === 50 && done === true) {
            const dataType = element[Object.keys(element)[0]];
            const templateCard = document.getElementById('topicPageCardTemp');
            const cardClone = templateCard.content.cloneNode(true);
            cardClone.getElementById('cardTopicTitle').textContent = dataType;
            cardClone.getElementById('cardTopicDesc').textContent = element.text;
            cardClone.getElementById('additionalBtn').id = cardClone.getElementById('additionalBtn').id + ` ${title}--*${dataType}`;
            // the link to additional content page
            cardClone.getElementById(`additionalBtn ${title}--*${dataType}`).addEventListener('click', (e) => createInitialGrid(e));
            allCardsCon.appendChild(cardClone) 
            done = false 
            return  
    }
    // to do the next card
    if (count === 0) {
        done = true;
        count = 50;
    } else count--
    requestAnimationFrame(() => generateDataCards(element, allCardsCon, title))
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
        document.getElementById('mainBioPage').removeChild(pageTopicTitle)
    }
    if (pageTopicDesc.length > 0) {
        for (let i = pageTopicDesc.length - 1; i >= 0; i--) {
            allCardsCon.removeChild(pageTopicDesc[i]);
        }
        document.getElementById('mainBioPage').removeChild(allCardsCon);
    }
    // bring the wheel home component back
    document.getElementById('mainBioPage').innerHTML = innerHTMLBackup;
    innerHTMLBackup = null;
    startDrawing();
}
// additional content page functions ---------------------------->
let  additionalHandler = 0;
function createInitialGrid(e) {
    animationLock = false;
    // fethc the topic & the sub topic from the id
    const id = e.target.id;
    const title = id.split('additionalBtn ')[1].split('--*')[0];
    const key = id.split('additionalBtn ')[1].split('--*')[1];
    const additionalDataArr = additionalData[title]; 
    const specificDataObject  = additionalDataArr.filter((obj, index) => {
        const objTitle = Object.keys(obj)[0]
        if (objTitle === key) {
            // save the object index
            return obj;
        }
    });
    const specificDataArray = specificDataObject[Object.keys(specificDataObject)[0]][key]
    // make the topic page disappear not (removed)
    document.getElementById('mainBioPage').innerHTML = '';
    // populate the initial template;
    populateAdditionalTemp(specificDataArray);
}
async function populateAdditionalTemp(dataArray) {
    // initialise with first data point
    const initialPoint = dataArray[additionalHandler];
    const template = document.getElementById('animationGridTemp');
    const clone = template.content.cloneNode(true);
    clone.getElementById('contentImage').src = initialPoint.src;
    const titleLabel = Object.keys(initialPoint)[0];
    clone.getElementById('contentTitle').textContent = `${titleLabel}: ${initialPoint[titleLabel]}`;
    const subLabel = Object.keys(initialPoint)[1];
    clone.getElementById('contentDesc').textContent = `${subLabel}: ${initialPoint[subLabel]}`;
    // add clone to body
    document.getElementById('mainBioPage').appendChild(clone)
    document.getElementById('animationGrid').removeChild(content)
    // next content should be with the next data point
    await nextContentAnimationInit(dataArray)
    // add the event for the arrows
    document.getElementById('prevArrow').addEventListener('click', (e) => nextAnimate(e, dataArray, 'prev'));
    document.getElementById('nextArrow').addEventListener('click', (e) => nextAnimate(e, dataArray, 'next'));
    document.getElementById('prevArrow').addEventListener('keyup', (e) => nextAnimate(e, dataArray, 'prev'));
    document.getElementById('nextArrow').addEventListener('keyup', (e) => nextAnimate(e, dataArray, 'next'));
}
// next/prev arrow animation functions (hard level)
// requires understanding of asynchronous calls promises frames box-model etc
async function nextAnimate(e, dataOfTopic, operation) {
    if (e.type === 'keyup') {
        if (e.key !== 'Enter') return
    }
    if (animationLock) {
        return
    }
    // ** step one get the folder icon
    const folderIcon = document.getElementById('folderIcon');
    // ** step two alter the div of content to be smaller thant the folder icon
    // do it by animation get smaller and smaller (asynchronously)
    const folderIconWidth = folderIcon.width;
    const folderIconHeight = folderIcon.height;
    const contentDiv = document.getElementById('content');
    const disposalAnimationShrink = await shrinkDiv(contentDiv, folderIconWidth / 2,
    folderIconHeight / 2, folderIcon, true, 0, undefined, undefined, operation, dataOfTopic, true);
    // shrinkDiv(contentDiv, folderIconWidth / 2,
    // folderIconHeight / 2, folderIcon, true, 0);
    if (disposalAnimationShrink) {
        // ** step three bring it into the file and remove it from the body
        archiveData(contentDiv, folderIcon, dataOfTopic)
    }
}
// shrinking animation function
function shrinkDiv(content, width, height, folderIcon, scaleCalc, targetScale, resolve, scaleCount, operation, dataOfTopic, added) {
    // do not proceed with any animation if there is no prev/next data point
    if (operation === 'next' && added === true) {
        if (additionalHandler !== dataOfTopic.length - 1) {
            additionalHandler++;
        } else {
            return new Promise((resolve, reject) => { 
                resolve(false);
            })
        }
    }
    if (operation === 'prev' && added === true) {
        if (additionalHandler !== 0) {
            additionalHandler--;
        } else {
            return new Promise((resolve, reject) => { 
                resolve(false);
            })
        }
    }
    animationLock = true;
    if (resolve === undefined) {
        document.getElementById('contentTitle').textContent = ``;
        document.getElementById('contentDesc').textContent = ``;
        document.getElementById('contentLine').style.display = 'none'
        return new Promise((resolve) => {
            requestAnimationFrame(() => shrinkDiv(content, width, height, folderIcon, scaleCalc, targetScale, resolve, 1, operation,dataOfTopic));      
        })
    } else {
        // scalling is calculated in this code block
        // necessary repetition because we want to return
        // the promise of only the first call initiated
        // by the await in the prevAnimate function
        // issue from using request animation frame with another await function
            if (scaleCount < targetScale) {
                resolve(true);
                return
            }
            if (scaleCalc) {
                targetScale = Math.min(width / content.offsetWidth, height / content.offsetHeight);
                scaleCalc = !scaleCalc
            }
            scaleCount = scaleCount - 0.003;
            if(scaleCount > targetScale) {
                content.style.transformOrigin = 'top left';
                content.style.transform = `scale(${scaleCount})`
            };
            requestAnimationFrame(() => shrinkDiv(content, width, height, folderIcon, scaleCalc, targetScale, resolve, scaleCount, operation, dataOfTopic));            
    }
}
// archive animation function 
function archiveData(content, folder, dataOfTopic) {
    document.getElementById('folderIcon').style.animation = 'rotation1 2s 1 forwards'
    content.style.position  = 'absolute';
    const folderRec = folder.getBoundingClientRect();
    const contentRec = content.getBoundingClientRect();
    // get the position of the mid point of the folder image
    const imgHeight = folderRec.height;
    const imgTop = folderRec.top + window.scrollY;
    const midpointY = imgTop + imgHeight / 2;
    // bring the div to the midpoint
    const startTop = contentRec.top + window.scrollY;
    const distanceY = midpointY - startTop - contentRec.height / 2;
    // the bigger the divisor the slower the animation
    // need to adjust count as well
    const divisor = 100
    const stepY = distanceY / divisor;
    let count = 0;
    function step() {
        count++;
        if (count <= divisor) {
        content.style.top = startTop + stepY * count + 'px';
        requestAnimationFrame(step);
        } else {
            setTimeout(() => {
                document.getElementById('folderIcon').style.animation = 'rotation2 2s 1 forwards'
                document.getElementById('animationGrid').removeChild(content)
                // next content should be with the next data point
                nextContentAnimationInit(dataOfTopic)
            }, 1000 * 1)
        }
    }
  requestAnimationFrame(step);
}
async function nextContentAnimationInit(dataOfTopic) {
    window.scrollTo({top: 0, behavior: "smooth"});
    return new Promise((resolve) => {
    // step one get the factory image location
    document.getElementById('statusText').textContent = 'Manufacturing';
    document.getElementById('statusDots').style.animation = 'move 3s infinite';
    const factory = document.getElementById('factoryIcon');
    const factoryRec = factory.getBoundingClientRect();
    const factoryTopEdge = factoryRec.top;
    const factoryLeftEdge = factoryRec.left;
    const midY = factoryTopEdge + factory.offsetHeight / 2;
    const midX = factoryLeftEdge + factory.offsetWidth / 2;
    // creat new content at this position
    const newPoint = dataOfTopic[additionalHandler];
    const template = document.getElementById('contentCardTemp');
    const clone = template.content.cloneNode(true);
    // populate new clone with new point data
    clone.getElementById('contentImage').src = newPoint.src;
    const titleLabel = Object.keys(newPoint)[0];
    clone.getElementById('contentTitle').textContent = `${titleLabel}: ${newPoint[titleLabel]}`;
    const subLabel = Object.keys(newPoint)[1];
    clone.getElementById('contentDesc').textContent = `${subLabel}: ${newPoint[subLabel]}`;
    const contentDiv = clone.getElementById('content');
    // add the div to the grid
    const grid = document.getElementById('animationGrid');
    grid.appendChild(contentDiv);
    // position the content div at the center of the factory icon
    const contentWidth = contentDiv.offsetWidth;
    const contentHeight = contentDiv.offsetHeight;
    const targetScale = Math.min((factory.offsetWidth / 2) / contentWidth, (factory.offsetHeight / 2) / contentHeight);
    const scaledTop = midY;
    const scaledLeft = midX;
    contentDiv.style.position = 'absolute';
    contentDiv.style.top = scaledTop + window.scrollY + 'px';
    contentDiv.style.left = scaledLeft + window.scrollX + 'px';
    contentDiv.style.transformOrigin = 'top left';
    contentDiv.style.transform = `scale(${targetScale})`;
    // shrink the content div
    // now lets move it to the empty space fisrt
    // get the position relative to the document
    const gridRect = grid.getBoundingClientRect();
    const gridLeft = gridRect.left;
    const gridTop = gridRect.top + window.scrollY;
    // remember 3 is automatic
    const gridSegmentWidth = grid.offsetWidth / 3;
    const midCellX = (gridLeft + (gridSegmentWidth * 2) / 2) + 30;
    const startLeft = contentDiv.offsetLeft;
    const distanceX = midCellX;
    // trial for mid cell point
    const gridSegmentHeight = grid.offsetHeight / 3;
    const midCellY = (gridTop + (gridSegmentHeight) / 2 ) - 50;
    // the bigger the divisor the slower the animation
    // need to adjust count as well
    const divisor = 100
    const stepX = distanceX / divisor;
    let count = 0;
    function step(resolve) {
        count++;
        if (count <= divisor) {
        content.style.left = startLeft - stepX * count + 'px';
        requestAnimationFrame(() => step(resolve));
        } else {
            setTimeout(() => {
                const startTop = contentDiv.offsetTop;
                const distanceY = midCellY;
                const divisor = 100
                const stepY = distanceY / divisor;
                let count = 0;
                function step(resolve) {
                    count++;
                    if (count <= divisor) {
                    contentDiv.style.top = startTop + stepY * count + 'px';
                    requestAnimationFrame(() => step(resolve));
                    } else {
                        // scale it up and done
                        requestAnimationFrame(() => scaleUp(contentDiv, 0.3, resolve))
                    }
                }
              requestAnimationFrame(() => step(resolve));
            }, 1000 * 1)
        }
    }
    requestAnimationFrame(() => step(resolve)) ;
    })
}
function scaleUp(container, scaleFactor, resolve) {
    if (scaleFactor < 1) {
        container.style.transform = `scale(${scaleFactor})`
        scaleFactor+= 0.01;
        requestAnimationFrame(() => scaleUp(container, scaleFactor, resolve))
    } else {
        animationLock = false;
        document.getElementById('statusText').textContent = 'IDLE'
        document.getElementById('statusDots').style.animation = '';
        resolve(true);
    }
}
// fixing layout issues
function fixLayout() {
    const myPhotoHeight = document.getElementById('anas').offsetHeight;
    const pageBioSec = document.getElementById('fullBioPage');
    if (!capturedHeight) {
        capturedHeight = true
        height = pageBioSec.offsetHeight;
    } 
    pageBioSec.style.height = `calc(${height ? height : pageBioSec.offsetHeight}px - ${myPhotoHeight - 36}px)`;
}
startDrawing();
// prepareTemplate('Movies')
// createInitialGrid({target: {id: `additionalBtn Movies--*Horror`}})