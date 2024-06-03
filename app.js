const express = require('express');
const path = require('path');

const app = express();
const port = 3000;
const plumbus = require('rickmortyapi');

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded());

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
})

app.get(`/characterQuery/:charID`, async (req, res) => {
    const characterID = req.params.charID;
    const characterQuery = await plumbus.getCharacter(parseInt(characterID));
    res.json(characterQuery);
})

app.get(`/multiCharacterQuery/:charParams`, async (req, res) => {
    const characterParams = req.params.charParams;
    const characterQuery = await plumbus.getCharacters({name: `${characterParams}`});
    res.json(characterQuery);
})

app.get(`/allCharacters/:page`, async (req, res) => {
    const page = req.params.page;
    const allCharacters = await plumbus.getCharacters({page: parseInt(page)});
    res.json(allCharacters);
})

app.listen(process.env.PORT || port, () => console.log(`server running on http://localhost:${port}`));