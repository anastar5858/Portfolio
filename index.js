let colorMsg = [{
    color: "#ee82ee",
    msg: "Hobbies",
}, {
    color: "#3cb371",
    msg: "Movies",
}, {
    color: "#ffa500",
    msg: "Books",
}]

let removedSegments = [];

class Circle {
    constructor(centerX, centerY, radius) {
        this.x = centerX;
        this.y = centerY;
        this.r = radius;
    }
    drawCircle(ctx, skipSegment) {
        let segment = 0;
        for (let i = 0; i < colorMsg.length; i++) {
            // draw circle segments
            let start = segment;
            ctx.beginPath();
            let ending = segment + 120 * (Math.PI / 180)
            if (i === skipSegment) {
                segment = ending
                const targetedData = colorMsg[i].msg;
                 // save that you have removed this segment
                 removedSegments.push(start);
                //  console.log('we have removed', removedSegments)
                // lets bring in the data
                prepareTemplate(targetedData)
                continue;
            }
            if (removedSegments.includes(start) && removedSegments.length !== colorMsg.length) {
                segment = ending
                continue;
            }
            if (removedSegments.length === colorMsg.length) {
                removedSegments = [];
                return
            }
            // validate if we have ran out of segments
            ctx.arc(this.x, this.y, this.r, start, ending)
            ctx.lineTo(this.x, this.y)
            segment = ending
            ctx.fillStyle = colorMsg[i].color;
            ctx.fill()
            ctx.stroke()
            // draw the text
            const centerSegment = start + 60 * (Math.PI / 180);
            const centerSegmentX = this.x + (Math.cos(centerSegment) * this.r /1.5);
            const centerSegmentY = this.y + (Math.sin(centerSegment) * this.r /1.5);
            ctx.save()
            ctx.translate(centerSegmentX, centerSegmentY)
            ctx.scale(1, -1);
            ctx.scale(-1, 1);
            ctx.rotate(centerSegment)
            ctx.font = "10px Arial";
            ctx.fillStyle = 'black';
            ctx.fillText(colorMsg[i].msg, 0, 0);
            ctx.restore();
        }
    }

    removeSegment(ctx, stopping, w, h, circle) {
        switch (true) {
            case stopping > 0 && stopping < 120:
                ctx.clearRect(0, 0, w, h);
                this.drawCircle(ctx, 0);
                circle.drawSpinner(ctx)
                break;
            case stopping > 120 && stopping < 240:
                ctx.clearRect(0, 0, w, h);
                this.drawCircle(ctx, 1);
                circle.drawSpinner(ctx)
                break;
            case stopping > 240 && stopping < 360:
                ctx.clearRect(0, 0, w, h);
                this.drawCircle(ctx, 2);
                circle.drawSpinner(ctx)
                break;
        }
    }

    drawSpinner(ctx, angle, stopping, animate, w, h, circle) {
        if (animate && angle > stopping) {
            // remove the segment and display the next page hypothetically
            this.removeSegment(ctx, stopping, w, h, circle)
            return
        }
        if (animate) {
            ctx.clearRect(0, 0, w, h);
            this.drawCircle(ctx);
        }
        ctx.save()
        ctx.beginPath();
        ctx.translate(this.x, this.y)
        ctx.rotate(angle * (Math.PI / 180))
        ctx.moveTo(0 + 35, 0)
        ctx.arc(0, 0,20, 90 * (Math.PI / 180), 280* (Math.PI / 180), false)
        ctx.moveTo(0 + 35, 0)
        ctx.fillStyle = 'black';
        ctx.fill()
        ctx.stroke()
        ctx.font = "10px Arial";
        ctx.fillStyle = 'white';
        ctx.fillText("spin", 0 - 7.5, 0);
        ctx.restore()
        if (animate) {
            angle++
            requestAnimationFrame(() => this.drawSpinner(ctx, angle, stopping, animate, w, h, circle))
        }
    }
}


function animationHandler(e, circle) {
    // logic
    const canvas = e.target;
    const ctx = canvas.getContext('2d');
    const canvasHCenter = canvas.width/2;
    const canvasVCenter = canvas.height/2
    // check if we clciked on spinner
    const mouseX = e.offsetX;
    const mouseY = e.offsetY;
    if ((mouseX > canvasHCenter - 20 && mouseX < canvasHCenter + 20) && (mouseY > canvasVCenter - 20 && mouseY < canvasVCenter + 20)) {
        // animate the spinner
        const inDegrees = removedSegments.map((angle) => angle * (180 / Math.PI));
        let ending = 0;
        const stoppingAngle = Math.floor(Math.random() * 320);
        // check if stopping Angle is appropriate
        if (inDegrees.length !== colorMsg.length) {
            for (let i = 0; i < inDegrees.length; i++) {
                ending = inDegrees[i] + 120;
                if (inDegrees.length > 0 && (inDegrees[i] < stoppingAngle && stoppingAngle < ending)) {
                    animationHandler(e, circle)
                    return
                }
            }
        }
        requestAnimationFrame(() => circle.drawSpinner(ctx, 0, stoppingAngle, true, canvas.width, canvas.height, circle))
    }
}


function redrawDefault(ctx, circle, w, h) {
    ctx.clearRect(0, 0, w, h);
    circle.drawCircle(ctx);
    circle.drawSpinner(ctx)
}


function startDrawing() {
    const canvas = document.getElementById('spinningWheel');
    const ctx = canvas.getContext('2d');
    const canvasHCenter = canvas.width/2;
    const canvasVCenter = canvas.height/2
    const circle = new Circle(canvasHCenter, canvasVCenter, 110);
    circle.drawCircle(ctx);
    circle.drawSpinner(ctx)
    canvas.addEventListener('click', (e) => animationHandler(e, circle))
    const redrawBtn = document.getElementById('redrawCircle');
    redrawBtn.addEventListener('click', (e) => redrawDefault(ctx, circle, canvas.width, canvas.height))
}



startDrawing()



// topic title page function --->

function prepareTemplate(title) {
    const templateTop = document.getElementById('topicPageTitleTemp');
    const allCardsCon = document.createElement('div');
    allCardsCon.classList.add('topicCardContainer')
    allCardsCon.id = 'topicCardContainer'
    // handle each data accurately
    let data = null;
    let clon = templateTop.content.cloneNode(true);
    if (title === 'Books') {
        data = dataFile.booksData;
        clon.getElementById('topicWall').src = "./images/Topics wallpapers/books.png"
        clon.getElementById('topicTitle').textContent = "Books"
        document.body.appendChild(clon)
        document.body.appendChild(allCardsCon)
        for (let i = 0; i < data.length - 1; i++) {
            const templateCard = document.getElementById('topicPageCardTemp');
            const cardClone = templateCard.content.cloneNode(true);
            cardClone.getElementById('cardTopicTitle').textContent = data[i].book;
            cardClone.getElementById('cardTopicDesc').textContent = data[i].text;
            cardClone.getElementById('additionalBtn').id = cardClone.getElementById('additionalBtn').id + `books${data[0].book}`;
            allCardsCon.appendChild(cardClone)
        }
    }
    if (title === 'Hobbies') {
        data = dataFile.hobbiesData
        clon.getElementById('topicWall').src = "./images/Topics wallpapers/hobbies.png"
        clon.getElementById('topicTitle').textContent = "Hobbies"
        document.body.appendChild(clon)
        document.body.appendChild(allCardsCon)
        for (let i = 0; i < data.length - 1; i++) {
            const templateCard = document.getElementById('topicPageCardTemp');
            const cardClone = templateCard.content.cloneNode(true);
            cardClone.getElementById('cardTopicTitle').textContent = data[i].hobby;
            cardClone.getElementById('cardTopicDesc').textContent = data[i].text;
            cardClone.getElementById('additionalBtn').id = cardClone.getElementById('additionalBtn').id + `hobbies${data[0].hobby}`;
            allCardsCon.appendChild(cardClone)

        }
    }
    if (title === 'Movies') {
        data = dataFile.moviesData
        clon.getElementById('topicWall').src = "./images/Topics wallpapers/movies.png"
        clon.getElementById('topicTitle').textContent = "Movies"
        document.body.appendChild(clon)
        document.body.appendChild(allCardsCon)
        for (let i = 0; i < data.length - 1; i++) {
            const templateCard = document.getElementById('topicPageCardTemp');
            const cardClone = templateCard.content.cloneNode(true);
            cardClone.getElementById('cardTopicTitle').textContent = data[i].movie;
            cardClone.getElementById('cardTopicDesc').textContent = data[i].text;
            cardClone.getElementById('additionalBtn').id = cardClone.getElementById('additionalBtn').id + `movies${data[0].movie}`;
            allCardsCon.appendChild(cardClone)
        }
    }
    // make the home page dissapear
    document.getElementById('backToWheel').addEventListener('click', () => returnWheel())
    document.getElementById('fullBioPage').style.display = 'none'
}

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
    document.getElementById('fullBioPage').style.display = 'block'
}