/**********************************
        DECLARE NAMESPACE
***********************************/
const app = {}
app.selectionGenre = "";
app.currentDate = new Date();
app.todaysDate = `${app.currentDate.getFullYear()}-${("0" + (app.currentDate.getMonth() + 1)).slice(-2)}-${("0" + (app.currentDate.getDate())).slice(-2)}`;
app.futureDate = `${app.currentDate.getFullYear() + 1}-${("0" + (app.currentDate.getMonth() + 1)).slice(-2)}-${("0" + (app.currentDate.getDate())).slice(-2)}`;
app.games = [];
app.urlGen = `https://api.rawg.io/api/games?dates=${app.todaysDate},${app.futureDate}`;
app.url = app.urlGen;
app.pageNum = 1;
app.activeGameId;

// JQuery cache
app.$games = $('#gamesGrid');
app.$genreSelect = $('#dropdown');
app.$popupBox = $('#popupBox');
app.$fullScreenBackground = $('#fullScreenBackground');
app.$scrollUp = $('#scrollUp');
app.$closePopup= $('#closePopup');

/**********************************
            API CALL
***********************************/
app.apiGeneral = function(i){
    $.ajax({
        url: i,
        method: 'GET',
        dataType: 'json',
        headers: {
            'User-Agent': 'Web Dev Bootcamp Project'
        },
        data: {
            page: app.pageNum,
            page_size: 7
        }
    }).then((data)=>{
        app.games = data.results;
        app.gridCreation();
    })
}

/**********************************
            APP LOGIC
***********************************/
// Takes the information from the API call, iterates over the data to create cards for the games grid
app.gridCreation = function(){ 
    //Results array comes in from the API call and iterate over the array
    $.each(app.games, function(){
        let iconPlatforms = [];

        // Error handling in case some games don't have platforms defined
        if (this.parent_platforms !== undefined) {
            // Grab the platforms from the object and push to a new array
            const gamePlatforms = this.parent_platforms.map((i) => i.platform.slug);
            //calling the if statement to return an array of platform icons instead of platform names
            iconPlatforms = gamePlatforms.map(app.findIfPlatformsIcons).join("") 
        }

        // Iterate over the 'genres' property, push them to an array and join them into a string with a comma between
        const gameGenres = this.genres.map((i)=> i.name).join(", ");
        
        // Append the game card to the game grid using information from the API
        app.$games.append(
            `<li class="gameBox" id="${this.id}" tabindex="0">
                <div style="background-image:url(${this.background_image}")>
                    <h2>${this.name}</h2>
                </div>
                <article>
                    <time datetime="${this.released}">${this.released}</time>
                    <p>${gameGenres}</p>
                    <ul>${iconPlatforms}<ul>
                </article>
            </li>`
        );
    });

    // Add a card at the end of the grid that will be used to pull more games from the API when clicked
    app.$games.append(`<div class="gameBox getMore" tabindex="0">
        <label class="srOnly">Press to get more games</label>
        <span class="circle"></span>
        </div>`)
}

 // If statement to check for specific platform name from  the gamePlatforms array and push an array of list items with the corresponding icon, then join them into a string
app.findIfPlatformsIcons = function(i) {
    if (i === 'mac') {
        return '<li><i class="fab fa-apple" aria-hidden="true" title="Available for Mac"></i><span class="srOnly">Available for Mac</span></li>'
    } else if (i === 'pc') {
        return '<li><i class="fas fa-laptop" aria-hidden="true" title="Available for PC"></i><span class="srOnly">Available for PC</span></li>'
    } else if (i === 'android') {
        return '<li><i class="fab fa-android" aria-hidden="true" title="Available for Android"></i><span class="srOnly">Available for Android</span></li>'
    } else if (i === 'playstation') {
        return '<li><i class="fab fa-playstation" aria-hidden="true" title="Available for Playstation"></i><span class="srOnly">Available for Playstation</span></li>'
    } else if (i === 'xbox') {
        return '<li><i class="fab fa-xbox" aria-hidden="true" title="Available for Xbox"></i><span class="srOnly">Available for Xbox</span></li>'
    } else if (i === 'linux') {
        return '<li><i class="fab fa-linux" aria-hidden="true" title="Available for Linux"></i><span class="srOnly">Available for Linux</span></li>'
    } else if (i === 'nintendo') {
        return '<li><i class="fas fa-gamepad" aria-hidden="true" title="Available for Nintendo Switch"></i><span class="srOnly">Available for Nintendo Switch</span></li>'
    } else if (i === 'ios') {
        return '<li><i class="fab fa-app-store-ios" aria-hidden="true" title="Available for iPhone"></i><span class="srOnly">Available for iPhone</span></li>'
    }
}

// Populate the popup box when one of the game cards are clicked and make it appear
app.gamePopup = function(data) {
    // Grab the platforms from the object and push to a new array
    const gamePlatforms = data.parent_platforms.map((i)=> i.platform.slug);

    //calling the if statement to return an array of platform icons instead of platform names
    const iconPlatforms = gamePlatforms.map(app.findIfPlatformsIcons).join("") 

    // Iterate over the 'genres' property, push them to an array and join them into a string with a comma between
    const gameGenres = data.genres.map((i) => i.name).join(", ");

    // Change the elements within the '.popupBox' with the information for the game card that was clicked
    app.$popupBox.html(
        `<div class="popupHeader" value="${data.id}" style="background-image:url(${data.background_image}">
            <button tabindex="0" id="closePopup" class="closePopup">
                <label class="srOnly">Close the popup by pressing Escape</label>
                <i class="fas fa-times"></i>
            </button>
            <h2>${data.name}</h2>
            <ul>${iconPlatforms}</ul>
        </div>
        <div class="popupMeta">
            <time datetime="${data.released}">Release Date: ${data.released}</time>
            <p>Genre(s): ${gameGenres}</p>
        </div>
        <div class="popupDescription">
            ${data.description}
        </div>
        `
    ).fadeIn(300).focus();

    // Fade in the opaque background to make the popup box stand out more
    app.$fullScreenBackground.fadeIn(300);
    app.$scrollUp.fadeOut(300);
    app.popupBoxFocus();
}

/**********************************
        EVENT LISTENERS
***********************************/
// Event Listener looking for genre selection in the dropdown
app.selectionListener = function() {
    app.$genreSelect.on('change', function () {
        app.$games.empty();
        app.pageNum = 1

        // If statement to determine if option selected is 'allGames' or anything else, update the API url on change and populate the grid with games
        if ($(this).val() !== 'allGames') {
            app.url = `${app.urlGen}&genres=${$(this).val()}`;
            app.apiGeneral(app.url);
        } else {
            app.apiGeneral(app.urlGen);
            app.url = app.urlGen
        }
    });
}

//Event listener for the pop-up window for game details
app.gameDetailListener = function(){
    // On click, take the 'id' of the <li> (game card) and add it to the API call to get data on the specific game
    app.$games.on('click', 'li', function(){
        app.activeGameId = $(this).attr("id");  
        $.ajax({
            url: `https://api.rawg.io/api/games/${$(this).attr("id")}`,
            method: 'GET',
            dataType: 'json',
            headers: {
            'User-Agent': 'Web Dev Bootcamp Project'
            },
        }).then(function(data){
            app.gamePopup(data);
        })
    });
}

//Event listener to add next page of current specified filter of games
app.getMoreListener = function() {
    app.$games.on('click', '.getMore', function () {
        $(this).remove();
        app.pageNum ++;
        app.apiGeneral(app.url);
    })
}

// Event listeners for closing the popup window
app.closePopupBox = function() {
    // Function that hides the popup and the opaque background, sets focus back to the last clicked game card
    const fadingOut = function (){
        app.$popupBox.fadeOut(400);
        app.$fullScreenBackground.fadeOut(300);
        app.scrollUpEnter();
        $(`#${app.activeGameId}`).focus();
    }

    // Close the popup box when the "x" button is clicked
    app.$popupBox.on('click', '#closePopup', function() {
        fadingOut();
    })

    // Close the popup box when the opaque background is clicked (clicking outside of the popup box)
    app.$fullScreenBackground.on('click', function(){
        fadingOut();
    })

    // Close the popup when the "escape" key on the keyboard is pressed
    app.$popupBox.on('keyup', function(e){
        if (e.which === 27) {
            fadingOut();
        }
    })
}

// Event listener for tab and shift tab inside of popupBox to trap focus inside
app.popupBoxFocus = () => {
    app.$popupBox.on('keydown', function(e){
        if (e.which === 9 && e.shiftKey){
            e.preventDefault();
        }
    })
    app.$popupBox.on('keydown', '#closePopup', function(e){
        if (e.which === 9){
            e.preventDefault();
        }
    })
}

// Event listener for pressing "enter" on game cards
app.enterListenerGameCard = () => {
    app.$games.on('keydown', 'li', function(e){
        if (e.which === 13) {
            $(this).click();
        }
    })
}

// Event listener for pressing "enter" on the ".getMore" card
app.enterGetMoreCard = () => {
    app.$games.on('keyup', '.getMore', function(e) {
        if (e.which === 13) {
            $(this).click();
        }
    })
}

// Event listener showing the "scroll to top" button once the user scrolls down the site a certain amount
app.scrollUpEnter = function () {
    $(window).scroll(function(){
        if($(this).scrollTop() > app.$games.offset().top){
            app.$scrollUp.fadeIn(100);
        } else {
            app.$scrollUp.fadeOut(100);
        }
    })
}

// Event listener for the clicking on the "scroll to top" button, will send user back to the top of the site
app.scrollUpScrolling = function (){
    app.$scrollUp.on('click', function(){
        $('html, body').animate({scrollTop: 0}, 300);
    })
}

/**********************************
        INIT METHOD 
***********************************/
app.init = function() {
    app.selectionListener();
    app.gameDetailListener();
    app.getMoreListener();
    app.apiGeneral(app.urlGen);
    app.closePopupBox();
    app.enterListenerGameCard();
    app.enterGetMoreCard();
    app.scrollUpEnter();
    app.scrollUpScrolling();
}

/**********************************
        DOCUMENT READY 
***********************************/
$(function(){
    app.init();
})