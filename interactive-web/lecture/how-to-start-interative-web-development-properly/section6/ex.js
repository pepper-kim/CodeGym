const ilbuni = document.querySelector('.ilbuni.c');
    
function clickIlbuniHanlder() {
    ilbuni.classList.toggle('special');
}

ilbuni.addEventListener('click', clickIlbuniHanlder);