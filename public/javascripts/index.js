/**
 * Event handelers that call certain methods when certain assets
 * are clicked or certain events are complete
 */
function initHandlers(){

    socket.emit('load articles');

    socket
        .on('articles loaded',articlesLoaded)
    ;
}

/**
 * Logic depending on action of registering user
 */
function articlesLoaded(data){
    // console.log('articles loaded');
    // console.log(data);

    if(!data.success) showToastAlert('Issues Retrieving Articles');

    var articles_html = '';
    for(var i in data.data){
        articles_html += renderArticle(data.data[i]);
    }

    $('.news-articles').html(articles_html);
}

/**
 * 
 */
function renderArticle(data){

    if(data.title.includes('NPR')) data.title = data.title.replace('NPR', '');
    if(data.teaser.includes('NPR')) data.teaser = data.teaser.replace('NPR', '');

    let html = `<article class="item">` +
                    `<div class="item-info-wrap">` +
                        `<div class="item-info">` +
                            `<div class="slug-wrap">` +
                                `<h3 class="slug">` +
                                    `${(data.topic) ? data.topic : 'No topic found'}` +
                                `</h3>` +
                            `</div>` +
                            `<h2 class="title">` +
                                `${(data.title) ? data.title : 'No title found'}` +
                            `</h2>` +
                            `<p class="teaser">` +
                                `${(data.teaser) ? data.teaser : 'No teaser found'}` +
                            `</p>` +
                        `</div>` +
                    `</div>`   
    ;


    if(data.topic) html


    html += '</article>';
    return html;
}

/**
 * All the page requirements that need to be loaded from the start
 */
function init(){
    initHandlers();
}

/**
 * Setup everything on page loaded
 */
$(document).ready(function(){
     init();
});