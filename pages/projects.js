let scrollInitiatedByCode = false;
let scrollTarget;
let currentlyActive;
let currentlyActiveBackground;
function prepareProjectsCards() {
    const windowWidth = window.innerWidth;
    let alternate = false;
    let counter = 1;
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
        // download doc link
        clone.getElementById('projectDoc').href = `../Docs/Project ${counter}.docx`
        counter++;
        // alternate pic and desc on desktops only
        if (!alternate && windowWidth < 760) {
            clone.getElementById(`projects${project.name}`).style.background = 'url(../images/Background/backgroundSkill1.webp)';
            clone.getElementById(`projects${project.name}`).style.backgroundSize = 'cover'; 
            clone.getElementById(`projects${project.name}`).style.backgroundPosition = '0 0';
            clone.getElementById('projectLink').style.color = 'white';
            clone.getElementById('projectDoc').style.color = 'white';
            alternate = !alternate
        } else if (alternate && windowWidth < 760) {
            clone.getElementById(`projects${project.name}`).style.color = 'black';
            clone.getElementById('projectLink').style.color = 'black';
            clone.getElementById('projectDoc').style.color = 'black';
            alternate = !alternate

        }
        if (windowWidth >= 760) {
            const imageAndDescSec = clone.getElementById('imageAndDesc')
            imageAndDescSec.style.gap = '1rem';
            if (!alternate) {
                clone.getElementById(`projects${project.name}`).style.background = 'url(../images/Background/backgroundSkill1.webp)';
                clone.getElementById(`projects${project.name}`).style.backgroundSize = 'cover';
                clone.getElementById(`projects${project.name}`).style.backgroundPosition = '50% 50%';
                clone.getElementById('projectLink').style.color = 'white';
                clone.getElementById('projectDoc').style.color = 'white';
                imageAndDescSec.style.flexDirection = 'row';
                imageAndDescSec.style.marginLeft = '2rem';
                alternate = !alternate
            } else {
                clone.getElementById(`projects${project.name}`).style.color = 'black';
                clone.getElementById('projectLink').style.color = 'black';
                clone.getElementById('projectDoc').style.color = 'black';
                imageAndDescSec.style.flexDirection = 'row-reverse';
                imageAndDescSec.style.marginRight = '2rem';
                alternate = !alternate
            }
        }
        document.getElementById('mainProjects').appendChild(clone) 
    })
    // prepare navigation system
    prepareProjectNav(projects)
}
// inner project navigation
function prepareProjectNav(projects) {
    document.getElementById('projectNav').innerHTML = '';
    const counter = 1;
    projects.forEach((project) => {
        const li = document.createElement('li');
        li.id = `.projects${project.name}`;
        li.tabIndex = '0';
        li.addEventListener('click', scrollToProject);
        li.addEventListener('keyup', scrollToProject);
        li.style.background = `url(${project.img})`
        li.style.backgroundSize = 'cover'; 
        document.getElementById('projectNav').appendChild(li)
    })
}
let ended = false;
let prev;
let capturedDirection;
function scrollToProject(e) {
    if (e.type === 'keyup') {
        if (e.key !== 'Enter') return
    }
    const projectId = e.target.id.split('.')[1];
    const projectElement = document.getElementById(projectId);
    const projectElementTop = projectElement.getBoundingClientRect().top + window.scrollY;
    scrollTarget = Math.floor(projectElementTop - 10);
    scrollInitiatedByCode = true;
    // we are in the view
    const currentWindow = Math.floor(window.scrollY)
    const targetTopWithOffset = Math.floor(projectElementTop-10);
    if (currentWindow === targetTopWithOffset || currentWindow + 1 === targetTopWithOffset || currentWindow - 1 === targetTopWithOffset) {
        return
    }
    // now color it
    const allNavLinks = document.getElementById('projectNav').childNodes;
    allNavLinks.forEach((li) => {
        if (li === currentlyActive) {
            li.style.background = currentlyActiveBackground;
        }
    })
    allNavLinks.forEach((li) => {
        if (li.id.split('.')[1] === projectId) {
            currentlyActive = li;
            currentlyActiveBackground = li.style.background;
            li.style.background = 'hsl(49, 100%, 50%)';
        }
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
        scrollInitiatedByCode = false;
        scrollTarget = null; 
        ended = true
        capturedDirection = null;
        return
    }
    if ((ended === true && scrollInitiatedByCode === false) && scrollTarget !== null) {
        prepareProjectNav(projects);
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