{
    const stageEme = document.querySelector('.stage');
    const houseElem = document.querySelector('.house');
    const mousePos = { x: 0, y: 0 };
    let maxScrollValue;
    let lastScrollY;
    let characters = [];

    function resizeHandler() {
        maxScrollValue = document.body.offsetHeight - window.innerHeight;
    };


    window.addEventListener('scroll', () => {
        const scrollRadio = window.scrollY / maxScrollValue;

        moveHouse(houseElem, scrollRadio);
        updateCharacterDirection(characters, lastScrollY, window.scrollY);
        updateCharacterAnimation(characters, true);
        updateProgressBar(scrollRadio);

        lastScrollY = window.scrollY;
    });

    window.addEventListener('scrollend', () => {
        updateCharacterAnimation(characters, false);
    });

    window.addEventListener('mousemove', (e) => {
        mousePos.x = -1 + 2 * (e.clientX / window.innerWidth);
        mousePos.y = 1 - 2 * (e.clientY / window.innerHeight);

        stageEme.style.transform = `rotateX(${mousePos.y * 5}deg) rotateY(${mousePos.x * 5}deg)`;
    });


    window.addEventListener('resize', resizeHandler);
    resizeHandler();

    window.addEventListener('click', (e) => {
        const character = new Character({
            xPos: e.clientX / window.innerWidth * 100
        });
        characters.push(character);
    });
}

function moveHouse(houseElem, scrollRadio) {
    const zMove = scrollRadio * 970 - 490;
    houseElem.style.transform = `translateZ(${zMove}vw)`;
}

function updateCharacterDirection(characters, lastScrollY, currentScrollY) {
    if (lastScrollY === undefined) {
        lastScrollY = currentScrollY;
    }
    const scrollDiff = currentScrollY - lastScrollY;


    if (scrollDiff >= 0) {
        for (const character of characters) {
            character.changeDirection('forward');
        }
    } else {
        for (const character of characters) {
            character.changeDirection('backward');
        }
    }
}

function updateCharacterAnimation(characters, isRunning) {
    for (const character of characters) {
        if (isRunning) {
            character.run();
        } else {
            character.stop();
        }
    }
}

function updateProgressBar(scrollRadio) {
    const progressElem = document.querySelector('.progress-bar');
    progressElem.style.width = `${scrollRadio * 100}%`;
}