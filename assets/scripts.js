atLanding();
parseCreationDates();
emailCheck();

function atLanding() { //check at any page landing
    if (localStorage.getItem('darkTheme')) {
        document.querySelector('body').classList.add('dark');
    } else {
        localStorage.setItem('lightTheme', 'true');
        document.querySelector('body').classList.remove('dark');
    }
    LinkColorSet();
    setEmoji();
}

function LinkColorSet() {
    Array.from(document.links).forEach(link => { //random colour links hue rotator
        if (document.querySelector('body').classList.contains('dark')) {
            link.style.backgroundColor = 'hsla(' + ~~(360 * Math.random()) + ',' + '70%,' + '80%, 1)'; //pastel tone (80%)
        } else {
            link.style.backgroundColor = 'hsla(' + ~~(360 * Math.random()) + ',' + '70%,' + '40%, 1)'; //dark tone (40%)
        }
    });
}

function setEmoji() {
    if (document.querySelector('.moonEmoji')) { //button theme behaviour, where available
        document.querySelector('.moonEmoji').onclick = function () {
            if (localStorage.getItem('darkTheme')) { //change to light if dark was enabled
                localStorage.removeItem('darkTheme');
                localStorage.setItem('lightTheme', 'true');
                document.querySelector('body').classList.remove('dark');
            } else { //change to dark if light was enabled
                localStorage.removeItem('lightTheme');
                localStorage.setItem('darkTheme', 'true');
                document.querySelector('body').classList.add('dark');
            }
            atLanding(); //set the theme and the color links on click
        }

        document.querySelector('.moonEmoji').addEventListener('mouseenter', function (e) { //mouse over button
            document.querySelector('.moonEmoji').style.cursor = 'pointer';
        });

        if (localStorage.getItem('darkTheme')) { //everything ok, change the emoji
            setDarkEmoji();
        } else {
            setLightEmoji();
        }
    }
}

function setLightEmoji() {
    let sunEmoji = document.querySelector('.moonEmoji');
    sunEmoji.innerHTML = '🌤️';
    sunEmoji.title = 'Switch to dark theme';
}

function setDarkEmoji() {
    let d = new Date();
    let moonPhase = getMoonPhase(d.getDate(), d.getMonth() + 1, d.getFullYear());
    let moonEmoji = document.querySelector('.moonEmoji');

    switch (moonPhase) {
        case 0:
            moonEmoji.innerHTML = '🌑';
            moonEmoji.title = 'current Moon: New';
            break;
        case 1:
            moonEmoji.innerHTML = '🌒';
            moonEmoji.title = 'current Moon: Waxing Crescent';
            break;
        case 2:
            moonEmoji.innerHTML = '🌓';
            moonEmoji.title = 'current Moon: Quarter Crescent';
            break;
        case 3:
            moonEmoji.innerHTML = '🌔';
            moonEmoji.title = 'current Moon: Waxing Gibbous';
            break;
        case 4:
            moonEmoji.innerHTML = '🌕';
            moonEmoji.title = 'current Moon: Full';
            break;
        case 5:
            moonEmoji.innerHTML = '🌖';
            moonEmoji.title = 'current Moon: Waning Gibbous';
            break;
        case 6:
            moonEmoji.innerHTML = '🌗';
            moonEmoji.title = 'current Moon: Quarter Crepuscular';
            break;
        default:
            moonEmoji.innerHTML = '🌘';
            moonEmoji.title = 'current Moon: Waning Crepuscular';
            break;
    }
}

function getMoonPhase(day, month, year) { //moon phase calculator: https://gist.github.com/endel/dfe6bb2fbe679781948c
    let c = e = jd = b = 0;

    if (month < 3) {
        year--;
        month += 12;
    }

    ++month;

    c = 365.25 * year;
    e = 30.6 * month;
    jd = c + e + day - 694039.09;
    jd /= 29.5305882;
    b = parseInt(jd);
    jd -= b;

    b = Math.round(jd * 8);

    if (b >= 8) {
        b = 0;
    }

    return b;
}

function parseCreationDates() {
    if (document.querySelector('[data-uid]')) { //parse creation times to human readable form if any
        let arrayNodes = document.querySelectorAll('[data-uid]'); //all dates in js time from nodes

        let arrayDates = [...arrayNodes].map(i => i.dataset.uid); //new array from uids
        arrayDates.splice(0, Infinity, ...arrayDates.map(humaneDate)); //mutates the content of every array index with the results from the function

        if (arrayDates.length == 1) { //blogpost
            document.querySelector('.date > small').innerHTML = arrayDates[0];
        } else { // index or archives
            arrayNodes.forEach((node, indx) => node.title = arrayDates[indx]); //mutates (in place) each title of the nodes array with each index of the dates array
        }
    }
}

function humaneDate(date_str) { //js time to human readable form https://github.com/zachleat/Humane-Dates
    let time_formats = [
        [60, 'Just Now'],
        [90, '1 Minute'], // 60*1.5
        [3600, 'Minutes', 60], // 60*60, 60
        [5400, '1 Hour'], // 60*60*1.5
        [86400, 'Hours', 3600], // 60*60*24, 60*60
        [129600, '1 Day'], // 60*60*24*1.5
        [604800, 'Days', 86400], // 60*60*24*7, 60*60*24
        [907200, '1 Week'], // 60*60*24*7*1.5
        [2628000, 'Weeks', 604800], // 60*60*24*(365/12), 60*60*24*7
        [3942000, '1 Month'], // 60*60*24*(365/12)*1.5
        [31536000, 'Months', 2628000], // 60*60*24*365, 60*60*24*(365/12)
        [47304000, '1 Year'], // 60*60*24*365*1.5
        [3153600000, 'Years', 31536000], // 60*60*24*365*100, 60*60*24*365
        [4730400000, '1 Century'], // 60*60*24*365*100*1.5
    ];

    let time = ('' + date_str).replace(/-/g, '/').replace(/[TZ]/g, ' '),
        dt = new Date,
        seconds = ((dt - new Date(time) + (dt.getTimezoneOffset() * 60000)) / 1000),
        token = ' Ago',
        i = 0,
        format;

    if (seconds < 0) {
        seconds = Math.abs(seconds);
        token = '';
    }

    while (format = time_formats[i++]) {
        if (seconds < format[0]) {
            if (format.length == 2) {
                return format[1] + (i > 1 ? token : ''); // Conditional so we don't return Just Now Ago
            } else {
                return Math.round(seconds / format[2]) + ' ' + format[1] + (i > 1 ? token : '');
            }
        }
    }

    if (seconds > 4730400000) { // overflow for centuries
        return Math.round(seconds / 4730400000) + ' Centuries' + token;
    }

    return date_str;
}

function emailCheck() {
    if (document.querySelector('.cntct')) { //email inserter, lightly obfuscated, where available
        document.querySelector('.cntct').innerHTML = atob('PGEgaHJlZj0ibWFpbHRvOm9vcXFAdW9jLmVkdSIgdGl0bGU9IkhpIPCfkYsiPm9vcXFAdW9jLmVkdTwvYT4=');
    }
}
