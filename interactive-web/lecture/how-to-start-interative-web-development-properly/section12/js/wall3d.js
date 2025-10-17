{
    const houseElem = document.querySelector('.house');
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



    window.addEventListener('resize', resizeHandler);
    resizeHandler();
}
