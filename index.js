const e = require('express');
const express = require('express');
const path = require('path');

const app = express();
const port = 8080; // You can change the port if needed

app.get('/api/:domain/:tld', (req, res) => {
    //transfaire la requête vers le serveur DNS
    fetch(`https://api.buss.lol/domain/${req.params.domain}/${req.params.tld}`)
    .then(response => {
        if(!response.status === 404){
            return response.json()
        }else{
            return response.text()
        }
    })
    .then(data => {
        res.json(data);
    });
})
app.use(express.static(__dirname));

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});