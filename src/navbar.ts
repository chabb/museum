/**
 *
 * @author francois.chabbey
 *
 * Ad-hoc functions for the navbar
 *
 * This is more a 'decorative' navbar that anything else
 */

const selectorNavIntro = 'nav-intro';
const selectorNavMuseum = 'nav-museum';
const selectedClass = 'selected';

export function switchNavbarToIntro() {
    document.getElementById(selectorNavIntro).classList.add(selectedClass);
    document.getElementById(selectorNavMuseum).classList.add(selectedClass);
    document.getElementsByClassName('sub-title')[0].innerHTML = 'Introduction';
}

export function switchNavbarToMuseum() {
    document.getElementById(selectorNavMuseum).classList.add(selectedClass);
    document.getElementById(selectorNavIntro).classList.remove(selectedClass);
    document.getElementsByClassName('sub-title')[0].innerHTML = 'Pick your museum';
}

