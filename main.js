  const CONFIG = {
    commands: [
         { key: 'b', url: 'https://bcourses.berkeley.edu'},
         { key: 'c', url: 'https://calcentral.berkeley.edu/dashboard/'},
         { key: 'd', url: 'https://drive.google.com/drive', search: '/search?q=' },
         { key: 'gm', url: 'https://mail.google.com', search: '/mail/u/0/#search/' },
         { key: 'g', url: 'https://github.com', search: '/search?q=' },
         { key: 'gs', url: 'https://www.gradescope.com' },
         { key: 'h', url: 'https://hn.algolia.com', search: '/?query=' },
         { key: 'hbo', url: 'play.hbogo.com' },
         { key: 'n', url: 'https://netflix.com', search: '/search?q=' },
         { key: 'p', url: 'https://pinboard.in/', search: '/search/u:ssbash/?query=' },
         { key: 'ph', url: 'https://www.producthunt.com', search: '/search?q=' },
         { key: 'pi', url: 'https://piazza.com', search: '/search?q=' },
         { key: 'pm', url: 'https://mail.protonmail.com/login'},
         { key: 'r', url: 'https://www.reddit.com', search: '/search?q=' },
         { key: 't', url: 'https://twitter.com', search: '/search?q=' },
         { key: 'tw', url: 'https://www.twitch.tv/directory/following' },
         { key: 'v', url: 'https://www.theverge.com', search: '/search?q=' },
         { key: 'vm', url: 'https://vimeo.com', search: '/search?q=' },
         { key: 'w', url: 'https://wired.com', search: '/search/?q=' },
         { key: 'y', url: 'https://www.youtube.com', search: '/results?search_query=' }
    ],

     // if none of the keys are matched, this is used for searching
     //defaultSearch: 'https://www.google.com/search?q=',
     defaultSearch: 'https://duckduckgo.com/?q=',

    // the delimiter between the key and your search query.
    searchDelimiter: ':',

    // the delimiter between the key and a path.
    pathDelimiter: '/',

    // used for determining when to redirect directly to a url.
    urlRegex: /^(?:(http|https)?:\/\/)?(?:[\w-]+\.)+([a-z]|[A-Z]|[0-9]){2,6}/i,

    // if "urlRegex" matches but this doesn't, "http://" will be
    // prepended to the beginning of the query before redirecting.
    protocolRegex: /^[a-zA-Z]+:\/\//i,

    // Enter your coordinates here
    // Berkeley Coords
    // latitude: 37.8719, 
    // longitude: -122.2585
    latitude: 12.327334, 
    longitude: 76.640847
  };

  const DAY = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds

  var today = new Date(Date.now());
  var sols = SunCalc.getTimes(today, CONFIG.latitude, CONFIG.longitude)

  var sunrise = sols.sunrise;
  var sunset = sols.sunset;

  var soldate = sunrise;
  var soltext = "SUNRISE ";
  if (today > sunrise && today < sunset) {
      soldate = sunset;
      soltext = "SUNSET ";
  }

  display_solar(soldate, soltext, dayProg(today));
  display_daysleft(weekProg(today), monthProg(today), yearProg(today), yearProg(today));

  function dayProg(date) {
      var tomorrow = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1, 0, 0, 0);
	  return Math.round(100 * (1 - (tomorrow.getTime() - date.getTime())/DAY));
  }

  function weekProg(date) {
      var nextSunday = new Date(date.getFullYear(), date.getMonth(), date.getDate() - date.getDay() + 7, 0, 0, 0);
	  return Math.round(100 * (1 - (nextSunday.getTime() - date.getTime())/(DAY*7)));
  }

  function monthProg(date) {
	  var firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
	  var lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
	  var month_length = lastDay.getTime() - firstDay.getTime();
	  return Math.round(100 * (1 - (lastDay.getTime() - date.getTime())/(month_length)));
  }

  function yearProg(date) {
	  var firstDay = new Date(date.getFullYear(), 0, 1);
	  var lastDay = new Date(date.getFullYear(), 11, 31);
	  var year_length = lastDay.getTime() - firstDay.getTime();
	  return Math.round(100 * (1 - (lastDay.getTime() - date.getTime())/(year_length)));
  }

  function display_solar(date, text, prog) {
      document.getElementById("solar").innerHTML = text + date.getHours() + ":" + date.getMinutes() ;
      document.getElementById("solar").style.backgroundImage = "linear-gradient(to right, var(--dayprog) 0%, var(--dayprog)" + prog +"%, var(--solar)" + prog + "%, var(--solar) 100%)";
	  
  }

  function display_daysleft(week, month, year, prog) {
      document.getElementById("daysleft").innerHTML = week + " &#9679; " + month + " &#9679; " + year;
      document.getElementById("daysleft").style.backgroundImage = "linear-gradient(to right, var(--weekprog) 0%, var(--weekprog)" + prog +"%, var(--daysleft)" + prog + "%, var(--daysleft) 100%)";
	  
  }

  var searchForm = document.getElementById("search-form");
  var searchInput = document.getElementById("search-input");

  searchForm.addEventListener('submit', function(event) {
      if (event) event.preventDefault();
      const query = searchInput.value.trim();
      if (!query) {
          searchInput.value = '';
      }
      window.location.href = parse(query)
  }, false);

  function parse(query) {
      let redirectUrl = CONFIG.defaultSearch + encodeURIComponent(query);

      if (query.match(CONFIG.urlRegex)) {
          const hasProtocol = query.match(CONFIG.protocolRegex);
          redirectUrl = hasProtocol ? query : 'http://' + query;
      } else {
          const splitSearch = query.split(CONFIG.searchDelimiter);
          const splitPath = query.split(CONFIG.pathDelimiter);


          CONFIG.commands.forEach(command => {
              var isSearch = splitSearch[0] === command.key;
              var isPath = splitPath[0] === command.key;

              if (isSearch || isPath) {
                  if (splitSearch[1] && command.search) {
                      redirectUrl = prepSearch(command, splitSearch);
                  } else if (splitPath[1]) {
                      redirectUrl = prepPath(command, splitPath);
                  } else {
                      redirectUrl = command.url;
                  }
                  return true;
              }
          });
      }

      return redirectUrl;
  }

  function prepPath(command, query) {
      const path = shiftAndTrim(query, CONFIG.pathDelimiter);
      return `${command.url}/${path}`;
  }

  function prepSearch(command, query) {
      const search = shiftAndTrimAndEncode(query, CONFIG.searchDelimiter);
      return `${command.url}${command.search}${search}`;
  }

  function shiftAndTrim(arr, delimiter) {
      arr.shift();
      return arr.join(delimiter).trim();
  }

  function shiftAndTrimAndEncode(arr, delimiter) {
      return encodeURIComponent(shiftAndTrim(arr, delimiter));
  }
