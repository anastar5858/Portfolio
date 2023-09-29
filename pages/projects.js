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
                alternate = !alternate
            }
        }
        document.getElementById('mainProjects').appendChild(clone) 
    })
}
window.addEventListener('load', prepareProjectsCards);