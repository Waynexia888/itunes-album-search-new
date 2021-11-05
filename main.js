// -----------------------------------View--------------------------------------
const View = (() => {
    const domString = {
        albumContainer: '.main',
        searchResultInfo: '.search__result__info',
        albumContentList: '.album__content__list',
        searchInput: '.album__header__input',
        prevPage: '.last_page__input',
        nextPage: '.next_page__input',
        paginationDiv: '.pagination__div',
        albumLink: '.album__link',
    }

    const render = (template, element) => {
        element.innerHTML = template;
    }

    const generateAlbumItem = (album) => {
        // let collection = album.collectionName.length > 30 ? album.collectionName.substring(0, 30) : album.collectionName;
        return `<li class="album__content__list-item"><img src="${album.artworkUrl100}" class="album__list__image">
                <p><a target="_blank" class="album__link" href="https://www.google.com/">${album.collectionName}</a></p>
            </li>`;
    }

    const generateSearchResultTemplate = (res, name) => {
        return `<p>${res} results for "${name}"</p>`
    }

    const initialTemplate = () => {
        return `<header class="album__header">
                    <input type="text" placeholder="Search ...  " required class="album__header__input" />
                    <i class="fa fa-search search__icon" aria-hidden="true"></i>
                </header>
                <div class="search__result__info">Search Albums by Artist Name:</div>
                <section>
                    <ul class="album__content__list"></ul>
                </section>
                <div class="pagination__div">
                    <input type="hidden" value="Prev Page" class="last_page__input">
                    <input type="hidden" value="Next Page" class="next_page__input">
                </div>
                `
    }

    return {
        domString,
        render,
        generateAlbumItem,
        initialTemplate,
        generateSearchResultTemplate,
    }
})();
// -----------------------------------View End--------------------------------------

// -----------------------------------Model--------------------------------------
const Model = (() => {
    const getAlbums = (name, pageNumber) => {
        return fetch(`https://itunes.apple.com/search?term=${name}&media=music&entity=album&attribute=artistTerm&limit=20&offset=${(pageNumber - 1) * 20}`)
            .then(response => {
                return response.json()
            });
    }

    return {
        getAlbums
    }
})();
// -----------------------------------Model End--------------------------------------


// -------------------------------controller------------------------------------------
const AppController = ((model, view) => {
    let pageNumber = 1;

    const init = () => {
        const initTemplate = view.initialTemplate();
        const initElement = document.querySelector(view.domString.albumContainer);
        view.render(initTemplate, initElement);
        setupEvent();
    }

    const updateAndRenderAlbums = (name, pageNumber) => {
        model.getAlbums(name, pageNumber).then(data => {
            //console.log(data)

            let resultCount = data.resultCount;
            let albums = data.results;
            updateSearchResultCount(resultCount, name);
            updateAlbumList(albums);

            albums.forEach(album => {
                let artistViewUrl = album.artistViewUrl;
                return updateAlbumLink(artistViewUrl);
            })
        })
    }

    const updateAlbumLink = (url) => {
        const albumLinkAll = document.querySelectorAll(view.domString.albumLink);
        albumLinkAll.forEach(
            albumLink => albumLink.addEventListener('click', () => {
                albumLink.setAttribute("href", url);
            })
        )
    }

    const updateSearchResultCount = (resultCount, name) => {
        const initSearchTemplate = View.generateSearchResultTemplate(resultCount, name);
        const initSearchElement = document.querySelector(View.domString.searchResultInfo);
        View.render(initSearchTemplate, initSearchElement);
    }

    const updateAlbumList = (albums) => {
        const albumContentListElement = document.querySelector(View.domString.albumContentList);
        let albumContentListTemplate = albums
            .map(album => View.generateAlbumItem(album))
            .join("");

        View.render(albumContentListTemplate, albumContentListElement);
    }

    const setupEvent = () => {
        const prevPage = document.querySelector(view.domString.prevPage);
        const nextPage = document.querySelector(view.domString.nextPage);

        const searchInput = document.querySelector(view.domString.searchInput);
        searchInput.addEventListener("keyup", (event) => {
            // console.log(event.target.value)
            searchInput.value = event.target.value;
            if (event.key === "Enter") {
                let name = searchInput.value;
                updateAndRenderAlbums(name, pageNumber)
                nextPage.setAttribute("type", "button");
                //searchInput.value = "";
            }
        })

        // Prev Page
        prevPage.addEventListener("click", () => {
            let name = searchInput.value;
            if (pageNumber > 1) {
                pageNumber--;
                console.log(pageNumber);
                updateAndRenderAlbums(name, pageNumber);
                if (pageNumber == 1) prevPage.setAttribute("type", "hidden");
            }
        })

        // Next Page
        nextPage.addEventListener("click", () => {
            let name = searchInput.value;
            pageNumber++;
            console.log(pageNumber);
            updateAndRenderAlbums(name, pageNumber);
            prevPage.setAttribute("type", "button");
        })
    }

    return {
        init
    }
})(Model, View);

AppController.init();

//---------------------------------Controller End---------------------------------- 