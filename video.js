
play = function (details) {
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
    v.src = baseURLNoApi + 'latest_version?id=' + details.videoId + '&itag=22&local=true';
    $('#player .video-container').appendChild(v);
    v.controls = true;

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
    var x = videoObj.videoThumbnails.find(f => f.quality === 'high');
    // console.log(x);
    return x;
}

async function getAuthorThumbnail(videoObj) {
    var x = await fetch(baseURL + 'channels/' + videoObj.authorId).then(t => t.json());
    // console.log(x);
    return x.authorThumbnails[0].url;
}

async function videoPreplayCard(details, AuthorThumbnail, videoData) {
    var cardModal = modal(/*html*/`
        <div class="thumbnail-wrapper">
            <button class="close" ><div style="display:flex; align-items: center;"><img src="/assets/close.svg" style="width:32px;height:32px;"></div></button>
            <img class="thumbnail">
        </div>
        <div class="details">
            <h1 class="title">Video title</h1>
            <div class="author">
                <img class="author-pfp">
                <span class="author-name"></span>
            </div>
            <div class="description-wrapper"><p class="description"><span class="muted">loading description...</span></p></div>
            <p>More info Todo..</p>
            <button class="begin">Play Video</button>
        </div>
        `);
    cardModal.querySelector(".thumbnail").src = getVideoThumbnail(details).url;
    cardModal.querySelector(".title").innerText = details.title;
    cardModal.querySelector(".author-name").innerText = details.author;
    cardModal.querySelector(".author-pfp").src = AuthorThumbnail;
    cardModal.querySelector(".description").innerText = videoData.description;

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