function getParams() {

  var params = {},
      pairs = document.URL.split('?')
             .pop()
             .split('&');

  for (var i = 0, p; i < pairs.length; i++) {
         p = pairs[i].split('=');
         params[ p[0] ] =  p[1];
  }     

  return params;
}

function flatten(a) {
  return Array.isArray(a) ? [].concat.apply([], a.map(flatten)) : a;
}
function shuffle(array) {
  var currentIndex = array.length,
    temporaryValue,
    randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {
    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

let continent = Intl.DateTimeFormat().resolvedOptions().timeZone.split("/")[0];
// Europe, America, Australia, Asia, Africa else puffyan.us

// alert('Choosing the best server based on your time zone. Note that this may be wrong if your clock is set incorrectly.');

let baseURLNoApi;

let servers = [
  "https://vid.puffyan.us/", // United States
  "https://invidious.weblibre.org/", // Chile
  "https://invidious.flokinet.to/", // Romania
];

if (continent === "America") {
  baseURLNoApi = servers[0];
} else if (continent === "Australia") {
  baseURLNoApi = servers[1];
} else if (continent === "Europe") {
  baseURLNoApi = servers[2];
} else if (continent === "Asia") {
  baseURLNoApi = servers[2];
} else if (continent === "Africa") {
  baseURLNoApi = servers[2];
} else {
    baseURLNoApi = servers[0]
}

let baseURL = baseURLNoApi + "api/v1/";

// https://wttr.in/?format=j1 weather api for later.

$ = (q) => document.querySelector(q);

makeId = (_) => {
  let ID = "";
  let characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  for (var i = 0; i < 12; i++) {
    ID += characters.charAt(Math.floor(Math.random() * 36));
  }
  return ID;
};

clearCardList = function (element) {
  element.innerHTML = "";
};

function callInterests() {
  // if (confirm("Hello please confirm your interests yes or no!!!!!!!!!")) {
  //   localStorage.setItem(
  //     "interests",
  //     '["coding","news","hardware","cars","design"]'
  //   );
  //   location.reload();

  // }
  var interestChooser = modal(/*html*/`
      <div style="text-align:center; width:100%">
        <h1>Welcome to Televerse!</h1>
        <p>Please pick a few interests that you have so you can get better recommendations.</p>
        <div style="display:flex; flex-direction:column;">
          <input style="margin-bottom:10px;" type="text" placeholder="Interest..." id="interest1"/>
          <input style="margin-bottom:10px;" type="text" placeholder="Interest..." id="interest2"/>
          <input style="margin-bottom:10px;" type="text" placeholder="Interest..." id="interest3"/>
          <input style="margin-bottom:10px;" type="text" placeholder="Interest..." id="interest4"/>
          <button class="begin">Go!</button>
        </div>
      </div>
  `)
  let i1 = $("#interest1")
  let i2 = $("#interest2")
  let i3 = $("#interest3")
  let i4 = $("#interest4")
  interestChooser.querySelector(".begin").onclick = () => {
    localStorage.setItem("interests", `["${i1.value}", "${i2.value}", "${i3.value}", "${i4.value}"]`)
    location.reload()
  }
}

if (localStorage.getItem("continueWatched") == null) {
  // Initialize wiht empty array
  localStorage.setItem("continueWatched", "[]");
} else {
  // Get videos
  getContinueWatching();
}

if (!localStorage.getItem("interests") == true) {
  callInterests();
  console.log("hi")
} else {
  let interestsObj = localStorage.getItem("interests");

  let interestsArray = [];
  try {
    // Attempt to read it as JSON string or array
    interestsArray = JSON.parse(interestsObj);
  } catch (e) {
    closeModal();
    var interestError = modal(/*html*/`
      <div style="text-align:center; width:25vw">
        <h1>Uh oh!</h1>
        <p>Your interests failed to load</p>
        <span><button class="refreshinterests" style="margin-right:5px;">Reload</button><button class="clearinterests" style="margin-left:5px;">Clear Interests</button></span>
      </div>
    `)
    interestError.querySelector(".refreshinterests").onclick = () => {
      location.reload()
    }
    interestError.querySelector(".clearinterests").onclick = () => {
      localStorage.removeItem("interests")
      location.reload()

    }
  }

  let reqs = [];

  for (let i = 0; i < interestsArray.length; i++) {
    // console.log('Interest ' + i + " is", interestsArray[i]);

    let x = fetch(
      baseURL + "search?q=" + interestsArray[i] + "&region=US"
    ).then((r) => r.json());
    reqs.push(x);
  }

  // Wait for all requests to complete
  Promise.all(reqs).then((r) => {
    let recommended = shuffle(flatten(r)).slice(0, 10);
    clearCardList($(".recommended-cards"));
    for (let i = 0; i < recommended.length; i++) {
      // console.log(recommended[i]);
      createVideoCard($(".recommended-cards"), recommended[i]);
    }
  });
}

window.addEventListener("load", (_) => {
  // Form input stuff
  $(".header form").addEventListener("submit", (e) => {
    e.preventDefault();
    let searchQuery = e.target.querySelector('input[name="search"]').value;
    let x = fetch(
      baseURL + "search?q=" + encodeURIComponent(searchQuery) + "&region=US"
    )
      .then((r) => r.json())
      .then((arr) => {
        let searchModal = modal(
          '<h1>Search results</h1><div class="results"></div>'
        );

        searchModal.style.height = "85vh"
        searchModal.style.overflowX = "hidden"
        // TODO: pagination system or just a way of loading 5 videos at a time when you scroll down
        arr = arr.slice(0, 10);
        for (let i = 0; i < arr.length; i++) {
          createVideoCard(searchModal.querySelector("div"), arr[i]);
        }
      });
  });
});
