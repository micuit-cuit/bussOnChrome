const buss = {
    load : async function(url){
        //decoupe l'url, elle commence par buss:// après il y a l'url
        const urlParts = await dnsResolve(url)
        console.log(urlParts)
        fetch(`${urlParts.url}/${urlParts.path}`)
        .then(response => response.text())
        .then(data => {
            console.log(data)
            // si il y a un href="buss://..." on remplace par onclick="buss.load('buss://...')"
            data = data.replace(/href="buss:\/\/(.*?)"/g, 'onclick="buss.load(\'buss://$1\')"')
            //suprime les balises script
            data = replaceAllBalises(data, 'script')
            const div = document.createElement('div');
            div.innerHTML = data;
            document.body.innerHTML = '';
            document.body.appendChild(div);
        })
    }
}

async function dnsResolve(url){
    const pattern = /:[1-9]/
    console.log(url, pattern.test(url))
    if(pattern.test(url)){
        return {
            protocol: url.split('://')[0],
            url: "http://"+url.split('://')[1].split('/')[0],
            path: url.split('://')[1].split('/').slice(1).join('/')||'/index.html'    
        }
    }
    console.log(url)
    let urlParts = url.split('://')
    let protocol = urlParts[0]
    let urlOut = urlParts[1].split('/')[0].split('.')[0]
    let tld = urlParts[1].split('/')[0].split('.')[1]
    let path = urlParts[1].split('/').slice(1).join('/')
    let test =await fetch(`api/${urlOut}/${tld}`);
    let response = JSON.parse(await test.json())
    console.log(response)
    //si l'url commence ne commence pas par http on ajoute http://
    if(!response.ip.startsWith('http')){
        response.ip = 'http://'+response.ip
    }
    //replace github.com par raw.githubusercontent.com
    if(response.ip.includes('github.com')){
        response.ip = response.ip.replace('github.com', 'raw.githubusercontent.com')
        path = "main/"+(path?path:'index.html')
    }
    return {
        protocol: protocol,
        url: response.ip,
        path: path||'/index.html'
    }

    
}


function replaceAllBalises(data, balise , replace = ""){
    //dectecte toute les balises (<balise>...</balise> ou <balise ... />) et les remplace par replace
    data=  data.replace(new RegExp(`<${balise}.*?>(.*?)</${balise}>`, 'g'), replace)
    data = data.replace(new RegExp(`<${balise}.*?/>`, 'g'), replace)
    return data
}