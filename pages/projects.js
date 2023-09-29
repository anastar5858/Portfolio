let scrollInitiatedByCode = false;
let scrollTarget;
function prepareProjectsCards() {
    const windowWidth = window.innerWidth;
    let alternate = false;
    projects.forEach((project) => {
        // prepare the template
        const template = document.getElementById('projectCard');
        const clone = template.content.cloneNode(true);
        clone.getElementById('projects').id = `projects${project.name}`
        // title
        const titleH3 = clone.getElementById('title').children[0];
        titleH3.textContent = titleH3.textContent += project.name;
        // image and description
        const image = clone.getElementById('projectPic')
        image.src = project.img;
        const description = clone.getElementById('descPara');
        description.textContent = project.desc
        // skills
        for (const skill of project.skills) {
            const li = document.createElement('li');
            li.textContent = skill;
            clone.getElementById('skillsItem').appendChild(li)
        }
        clone.getElementById('projectLink').textContent = project.link;
        clone.getElementById('projectLink').href = project.link;
        clone.getElementById('projectLink').target = '_blank';
        // alternate pic and desc on desktops only
        if (!alternate && windowWidth < 760) {
            alternate = !alternate
        } else if (alternate && windowWidth < 760) {
            clone.getElementById(`projects${project.name}`).style.background = 'linear-gradient(to bottom, hsl(49, 100%, 60%) 70%, hsl(49, 100%, 80%))'
            alternate = !alternate

        }
        if (windowWidth >= 760) {
            console.log('desktop', alternate)
            const imageAndDescSec = clone.getElementById('imageAndDesc')
            imageAndDescSec.style.gap = '1rem';
            if (!alternate) {
                imageAndDescSec.style.flexDirection = 'row';
                imageAndDescSec.style.marginLeft = '2rem';
                alternate = !alternate
            } else {
                imageAndDescSec.style.flexDirection = 'row-reverse';
                imageAndDescSec.style.marginRight = '2rem';
                clone.getElementById(`projects${project.name}`).style.background = 'linear-gradient(to bottom, hsl(49, 100%, 60%) 70%, hsl(49, 100%, 80%))'
                alternate = !alternate
            }
        }
        document.getElementById('mainProjects').appendChild(clone) 
    })
    // prepare navigation system
    prepareProjectNav(projects)
}
function prepareProjectNav(projects) {
    projects.forEach((project) => {
        const li = document.createElement('li');
        li.id = `.projects${project.name}`;
        li.tabIndex = '0';
        li.addEventListener('click', scrollToProject);
        document.getElementById('projectNav').appendChild(li)
    })
}
let ended = false;
let prev;
let capturedDirection;
function scrollToProject(e) {
    const projectId = e.target.id.split('.')[1];
    const projectElement = document.getElementById(projectId);
    const projectElementTop = projectElement.getBoundingClientRect().top + window.scrollY;
    scrollTarget = Math.floor(projectElementTop - 10);
    scrollInitiatedByCode = true;
    // we are in the view
    const currentWindow = Math.floor(window.scrollY)
    const targetTopWithOffset = Math.floor(projectElementTop-10);
    // console.log('wow', currentWindow)
    if (currentWindow === targetTopWithOffset || currentWindow + 1 === targetTopWithOffset || currentWindow - 1 === targetTopWithOffset) {
        return
    }
    // now color it
    const allNavLinks = document.getElementById('projectNav').childNodes;
    allNavLinks.forEach((li) => {
        if (li.id.split('.')[1] === projectId) li.style.borderColor = 'hsl(49, 100%, 50%)';
        else li.style.borderColor = 'black';
    })
    window.scrollTo({
        top: projectElementTop - 10,
        behavior: 'smooth',
    })
}
window.addEventListener('scroll', (e) => {
    const current = Math.floor(window.scrollY);
    // capture the scroll direction to monitor sudden shifts (user action)
    if (!capturedDirection && scrollTarget) {
        if (current > scrollTarget) capturedDirection = 'up';
        else capturedDirection = 'down';
    }
    if (current === scrollTarget || current - 1 === scrollTarget) {
        console.log('last',current, scrollTarget)
        scrollInitiatedByCode = false;
        scrollTarget = null; 
        ended = true
        capturedDirection = null;
        return
    }
    if ((ended === true && scrollInitiatedByCode === false) && scrollTarget !== null) {
        const allNavLinks = document.getElementById('projectNav').childNodes;
        allNavLinks.forEach((li) => {
            li.style.borderColor = 'black';
        })
        ended = false
    }
    if (scrollTarget === null) {
        scrollTarget = undefined;
    }
    // try to capture sudden jumps;
    if (scrollTarget) {
        if (capturedDirection === 'down') {
            if (current < prev) {
                scrollInitiatedByCode = false;
                scrollTarget = null; 
                ended = true
                capturedDirection = null;
            }
        }
        if (capturedDirection === 'up') {
            if (current > prev) {
                scrollInitiatedByCode = false;
                scrollTarget = null; 
                ended = true
                capturedDirection = null;
            }
        }
    }
    prev = current;
})
window.addEventListener('load', prepareProjectsCards);