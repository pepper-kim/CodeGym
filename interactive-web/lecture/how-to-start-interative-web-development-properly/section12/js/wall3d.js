    {
    const stageEme = document.querySelector('.stage');
    const houseElem = document.querySelector('.house');
    const mousePos = { x: 0, y: 0 };
    let maxScrollValue;

    function resizeHandler() {
        maxScrollValue = document.body.offsetHeight - window.innerHeight;
    };


    window.addEventListener('scroll', () => {
        const scrollRadio = window.scrollY / maxScrollValue;

        const zMove = scrollRadio * 970 - 490;
        houseElem.style.transform = `translateZ(${zMove}vw)`;

        const progressElem = document.querySelector('.progress-bar');
        progressElem.style.width = `${scrollRadio * 100}%`;
    });

    window.addEventListener('mousemove', (e) => {
        mousePos.x = -1 + 2 * (e.clientX / window.innerWidth);
        mousePos.y = 1 - 2 * (e.clientY / window.innerHeight);

        stageEme.style.transform = `rotateX(${mousePos.y * 5}deg) rotateY(${mousePos.x * 5}deg)`;
    });


    window.addEventListener('resize', resizeHandler);
    resizeHandler();

    window.addEventListener('click', (e) => {
        new Character({
            xPos: e.clientX / window.innerWidth * 100
        });
    });
}
