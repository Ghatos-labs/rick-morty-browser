window.onload = async function() {
    let url = new URL(window.location.href)

    let frontendPage = url.searchParams.get("page")
    let characterId = url.searchParams.get("character")
    if(characterId !== null) {
        characterId = parseInt(characterId)
        createCharacterPage(characterId)
    }
    else {
        if(frontendPage === null || frontendPage === "undefined" || frontendPage < 1) {
            frontendPage = 1;
            window.history.pushState({page: frontendPage}, "Document", `?page=${frontendPage}`);
        }
        else {
            frontendPage = parseInt(frontendPage);
        }

        let {apiPage, apiFirstCharacter, apiLastCharacter, apiDoublePage} = correctPageToQuery(frontendPage);
        await queryPage(frontendPage, apiPage, apiFirstCharacter, apiLastCharacter, apiDoublePage);
        createPageSelectorButtons(frontendPage);
    }

    let searchForm = document.getElementById('form');

    searchForm.addEventListener('submit', function() {
        event.preventDefault();
        let searchBarValue = document.querySelector('#search-bar').value;
        if(searchBarValue === '') {
            searchBarValue = ' ';
        }
        let statusValue = document.querySelector('#status-dropdown').value;
        applySearch(searchBarValue, statusValue);
    })
}

function createCharacterPage(characterId) {
    let characterCardContainer = document.getElementById('character-card-container');
    characterCardContainer.innerHTML = '';
    fetch(`/characterQuery/${characterId}`)
        .then(res => res.json())
        .then(data => {
            let character = data.data
            console.log(character)
            let characterContainer = document.getElementById('character-container')
            characterContainer.innerHTML = ''
            let backButton = document.createElement('button')
            backButton.innerHTML = 'Back'
            backButton.onclick = function() {window.history.back()}
            backButton.className = 'back-button'
            
            characterContainer.appendChild(backButton)
            let characterInformationContainer = document.createElement('div')
            characterInformationContainer.className = 'character-information-container'
            let characterName = document.createElement('h1')
            characterName.innerHTML = "Name : " + character.name
            let characterImg = document.createElement('img')
            characterImg.src = character.image
            let characterStatus = document.createElement('p')
            characterStatus.innerHTML = "Status : " + character.status
            let characterSpecies = document.createElement('p')
            characterSpecies.innerHTML = "Species : " + character.species
            let characterGender = document.createElement('p')
            characterGender.innerHTML = "Gender : " + character.gender
            let characterOrigin = document.createElement('p')
            characterOrigin.innerHTML = "origins : " + character.origin.name
            characterInformationContainer.appendChild(characterName)
            characterInformationContainer.appendChild(characterImg)
            characterInformationContainer.appendChild(characterStatus)
            characterInformationContainer.appendChild(characterSpecies)
            characterInformationContainer.appendChild(characterGender)
            characterInformationContainer.appendChild(characterOrigin)
            characterContainer.appendChild(characterInformationContainer)
            window.scrollTo(0, 0)
        })
}

function correctPageToQuery(frontendPage) {
    let step = 8;
    let lastCharacter = frontendPage * step;
    let firstCharacter = lastCharacter - step + 1;
    let apiPage = Math.ceil(lastCharacter / 20);
    let apiDoublePage = Math.ceil(firstCharacter / 20) != apiPage;
    let apiFirstCharacter = firstCharacter - (apiPage - 1) * 20;
    let apiLastCharacter = lastCharacter - (apiPage - 1) * 20;
    return {apiPage, apiFirstCharacter, apiLastCharacter, apiDoublePage};
}

function createCharacterCard(container, character) {
    let characterCard = document.createElement('div');
    characterCard.className = 'character-card';
    let characterImg = document.createElement('img');
    characterImg.className = 'character-img';
    characterImg.src = character.image;
    let characterName = document.createElement('h1');
    characterName.innerHTML = character.name;
    let characterStatus = document.createElement('p');
    characterStatus.innerHTML = character.status;
    let characterButton = document.createElement('button');
    characterButton.className = 'character-button';
    characterButton.innerHTML = 'View Character';
    characterButton.onclick = function() {window.location.href = `?character=${character.id}`};
    characterCard.appendChild(characterImg);
    characterCard.appendChild(characterName);
    characterCard.appendChild(characterStatus);
    characterCard.appendChild(characterButton);
    container.appendChild(characterCard);
}

function createPageSelectorButtons(frontendPage) {
    let pageButtons = document.getElementById('page-buttons');
    pageButtons.innerHTML = '';
    
    if (frontendPage !== 1)
    {
        let firstButton = document.createElement('button');
        firstButton.innerHTML = 'First';
        firstButton.onclick = function() {changePage(1)};
        pageButtons.appendChild(firstButton);
        let previousButton = document.createElement('button');
        previousButton.innerHTML = 'Previous';
        previousButton.onclick = function() {changePage(frontendPage - 1)};
        pageButtons.appendChild(previousButton);
    }

    for (let i = frontendPage - 2; i <= frontendPage + 2; i++)
    {
        if (i == frontendPage)
        {
            let currentPage = document.createElement('div');
            currentPage.innerHTML = i;
            pageButtons.appendChild(currentPage);
        }
        else if (i > 0)
        {
            let pageButton = document.createElement('button');
            pageButton.innerHTML = i;
            pageButton.onclick = function() {changePage(i)};
            pageButtons.appendChild(pageButton);
        } 
    }

    let nextButton = document.createElement('button');
    nextButton.innerHTML = 'Next';
    nextButton.onclick = function() {changePage(frontendPage + 1)};
    pageButtons.appendChild(nextButton);
    let lastButton = document.createElement('button');
    lastButton.innerHTML = 'Last';
    let maxPage = getMaxPage()
    lastButton.onclick = function() {changePage(maxPage)};
    pageButtons.appendChild(lastButton);
}

async function getMaxPage() {
    await fetch('/allCharacters/1')
        .then(res => res.json())
        .then(data => {
            let maxPage = Math.ceil(data.data.info.count / 8);
            return maxPage;
        });
}

function changePage(newPage) {
    if (newPage < 1)
    {
        newPage = 1;
    }
    window.history.pushState({page: newPage}, "Document", `?page=${newPage}`);
    let {apiPage, apiFirstCharacter, apiLastCharacter, apiDoublePage} = correctPageToQuery(newPage);
    queryPage(newPage, apiPage, apiFirstCharacter, apiLastCharacter, apiDoublePage);
    createPageSelectorButtons(newPage);
    window.scrollTo(0, 0);
}

async function queryPage(page, apiPage, apiFirstCharacter, apiLastCharacter, apiDoublePage) {
    let containerContent = document.getElementById('character-card-container');
    if(!apiDoublePage) {
        await fetch(`/allCharacters/${apiPage}`)
            .then(res => res.json())
            .then(data => {characters = data.data.results;})
            .then(function() {
                containerContent.innerHTML = '';
                for (i = apiFirstCharacter; i <= apiLastCharacter; i++)
                {
                    createCharacterCard(containerContent, characters[i - 1]);
                }
            });
    }
    else {
        await fetch(`/allCharacters/${apiPage}`)
            .then(res => res.json())
            .then(data => {characters1 = data.data.results;})
            .then(function() {
                containerContent.innerHTML = '';
                for (i = 20 + apiFirstCharacter; i <= 20; i++)
                {
                    createCharacterCard(containerContent, characters1[i - 1]);
                }
            });
        await fetch(`/allCharacters/${apiPage + 1}`)
            .then(res => res.json())
            .then(data => {characters2 = data.data.results;})
            .then(function() {
                for (i = 1; i <= apiLastCharacter; i++)
                {
                    createCharacterCard(containerContent, characters2[i - 1]);
                }
            });
    }
}

function submitSearchForm() {
    event.preventDefault();
    let searchForm = document.getElementById('form');
    let searchBarValue = document.querySelector('#search-bar').value;
    let statusValue = document.querySelector('#status-dropdown').value;
    applySearch(searchBarValue, statusValue);
}

async function applySearch(userSearch, selectedStatus)
{
    let container = document.getElementById('character-card-container');
    container.innerHTML = '';
    let pageButtons = document.getElementById('page-buttons');
    pageButtons.innerHTML = '';
    await fetch(`/multiCharacterQuery/${userSearch}`)
        .then(res => res.json())
        .then(data => {characters = data.data.results;})
        .then(function() {
            console.log(selectedStatus)

            for (i = 0; i < characters.length; i++)
            {
                if (characters[i].name.toLowerCase().includes(userSearch.toLowerCase()) && (selectedStatus === 'all' || characters[i].status.toLowerCase() === selectedStatus.toLowerCase()))
                {
                    createCharacterCard(container, characters[i]);
                }
            }
        });
}
