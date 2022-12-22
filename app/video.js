function secondsToHMS(seconds) {
    const hours = Math.floor(seconds / 3600);
    const remainingSeconds = seconds % 3600;
    const minutes = Math.floor(remainingSeconds / 60);
    const finalSeconds = remainingSeconds % 60;
    let timeString = '';
    if (hours > 0) {
        timeString += hours.toString();
        timeString += ':';
    }
    timeString += minutes.toString().padStart(2, '0');
    timeString += ':';
    timeString += finalSeconds.toString().padStart(2, '0');
    return timeString;
}
function addCommas(number) {
    return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

var play = function (details, timeinsec) {
    if (!timeinsec) {
        timeinsec = 0
    }
    // This should just be overlayed on the main ui to make the whole thing more responsive.
    $('#player').classList.add('show');
    try { $('#player .video-container video').remove() } catch (e) { }

    // let recentsExample = [{id: "dQw4w9WgXcQ"}]
    let continueWatching = [];
    try {
        continueWatching = JSON.parse(localStorage.getItem("continueWatched"));
    } catch (e) {
        continueWatching = [];
    }

    if (!continueWatching) {
        continueWatching = [];
    }

    if (continueWatching.filter(x => x !== null).find(x => x.id === details.videoId) === undefined) {
        continueWatching = [{ id: details.videoId }, ...continueWatching];
    }
    localStorage.setItem("continueWatched", JSON.stringify(continueWatching))
    let v = document.createElement('video');
    v.src = baseURLNoApi + 'latest_version?id=' + details.videoId + '&itag=22&local=true#t=' + timeinsec;
    $('#player .video-container').appendChild(v);
    v.controls = true;
    v.autoplay = true;

    v.addEventListener('ended', (e) => {
        // VIDEO IS FINISHED WATCHING
        // [continueWatching.findIndex(c => c.id === details.videoId)]
        continueWatching = continueWatching.filter(x => x.id !== details.videoId);
        localStorage.setItem('continueWatched', JSON.stringify(continueWatching));

        $('#player').classList.remove('show');

        getContinueWatching();
    });
}

function getContinueWatching() {
    let videos
    try {
        videos = JSON.parse(localStorage.getItem('continueWatched'));
    } catch (e) {
        return
    }

    var ctw = [];

    clearCardList($('.continue-cards'));

    if (videos.length === 0) {
        $('.continue-cards').innerText = "There are no videos to continue watching.";
        return false;
    }

    for (let i = 0; i < videos.length; i++) {
        if (videos[i] === null) continue;

        // console.log('Continued ' + i + " is", videos[i].id);

        let x = fetchVideoData(videos[i].id);
        ctw.push(x)
    }

    // Wait for all requests to complete
    Promise.all(ctw).then(r => {
        let recommended = r;
        for (let i = 0; i < recommended.length; i++) {
            // console.log(recommended[i]);
            createVideoCard($(".continue-cards"), recommended[i]);
        }
    });
}

function getVideoThumbnail(videoObj) {
    // var x = videoObj.videoThumbnails.find(f => f.quality === 'high');
    var x = videoObj.videoThumbnails.find(f => f.quality === 'sddefault');
    return x;
}

async function getAuthorThumbnail(videoObj) {
    var x = await fetch(baseURL + 'channels/' + videoObj.authorId).then(t => t.json());
    // console.log(x);
    return x.authorThumbnails[0].url;
}

async function videoPreplayCard(details, AuthorThumbnail, videoData) {
    closeModal();
    var cardModal = modal(/*html*/`
        <div class="thumbnail-wrapper">
            <button class="close" ><div style="display:flex; align-items: center;"><img src="/assets/close.svg" style="width:32px;height:32px;"></div></button>
            <img class="thumbnail">
        </div>
        <div class="details">
            <h1 class="title">Video title</h1>
            <p class="video-meta"><span class="length"></span> • Published <span class="date">(no)</span> • <span class="views">(no)</span> views</p>
            <div class="author">
                <img class="author-pfp">
                <span class="author-name"></span> • <span class="author-subs">(no)</span> subscribers
            </div>
            <div class="description-wrapper"><p class="description"><span class="muted">loading description...</span></p></div>
            <button class="begin">Play Video</button>
        </div>
        `);
    cardModal.querySelector(".thumbnail").src = getVideoThumbnail(details).url;
    cardModal.querySelector(".title").innerText = details.title;
    cardModal.querySelector(".author-name").innerText = details.author;
    cardModal.querySelector(".author-pfp").src = AuthorThumbnail;
    cardModal.querySelector(".author-subs").innerText = videoData.subCountText;
    cardModal.querySelector(".description").innerHTML = videoData.descriptionHtml;
    // <p class="video-meta"><span class="length"></span> • Published <span class="date">(no)</span> • <span class="views">(no)</span> views</p>
    let meta = cardModal.querySelector('.video-meta');
    meta.querySelector('.length').innerText = secondsToHMS(details.lengthSeconds);
    meta.querySelector('.date').innerText = details.publishedText;
    meta.querySelector('.views').innerText = addCommas(details.viewCount);

    // Parse links to match them up correctly
    var links = cardModal.querySelector(".description").querySelectorAll('a');
    for (let i = 0; i < links.length; i++) {
        var link = links[i];
        var linkGoes = link.href;
        var htRgx = /\/hashtag\/(.*)/;
        var htCheck = htRgx.test(linkGoes);
        if (htCheck === true) {
            link.classList.add('link-hashtag');
            link.href = 'javascript:void(0)';
            link.innerText = htRgx.exec(linkGoes)[1];
            link.onclick = e => {
                // TODO, do something with linkGoes
                alert('#' + e.target.innerText);
            }
        } else {
            // generic link

            if (link.dataset.onclick === 'jump_to_time') {
                link.classList.add('link-timestamp');
            } else {
                link.classList.add('link-generic');
            }
        }
    }


    cardModal.querySelector('button.close').onclick = () => {
        closeModal();
    }
    cardModal.querySelector('button.begin').onclick = () => {
        closeModal();
        play(details);
    }
}

createVideoCard = async function (parent, details) {
    var card = document.createElement('div');
    card.classList.add('card');
    card.classList.add('video-card');
    card.innerHTML = `<img class="thumbnail"><div class="overlay"></div><span class="details"><span class="author"><img class="author-pfp"><span class="author-name"></span></span><span class="title"></span></span>`;
    card.querySelector('.title').innerText = details.title;
    card.querySelector('.thumbnail').src = getVideoThumbnail(details).url;
    let videoData = await fetchVideoData(details.videoId);
    let AuthorThumbnail = details.authorThumbnails !== undefined ? details.authorThumbnails[0].url : videoData.authorThumbnails[0].url;
    card.addEventListener("click", async _ => {
        // play(details)
        console.log(details);
        await videoPreplayCard(details, AuthorThumbnail, videoData);
    })
    card.querySelector('.author-name').innerText = details.author;
    card.querySelector('.author-pfp').src = AuthorThumbnail;
    parent.appendChild(card);
    return card;
}

function fetchVideoData(videoId) {
    return fetch(baseURL + 'videos/' + videoId).then(j => j.json());
}