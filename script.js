const buss = {
    load : async function(url){
        //decoupe l'url, elle commence par buss:// après il y a l'url
        const urlParts = await dnsResolve(url)
        console.log(urlParts)
        fetch(`${urlParts.url}/${urlParts.path}`)
        .then(response => response.text())
        .then(async data => {
            // si il y a un href="buss://..." on remplace par onclick="buss.load('buss://...')"
            console.log(data)
            data = data.replace(/href="buss:\/\/(.*?)"/g, 'onclick="buss.load(\'buss://$1\')"')
            let scriptLua =  []
            //recupere tout les script lua
            const scriptContentRegex = /<script\b[^>]*>([\s\S]*?)<\/script>/gm
            const scriptSrcRegex = /<script\b[^>]*\bsrc=["']?([^"'>]+)["']?[^>]*>.*?<\/script>/gm
            let match = scriptContentRegex.exec(data)
            while(match){
                scriptLua.push(match[1])
                match = scriptContentRegex.exec(data)
            }
            match = scriptSrcRegex.exec(data)
            while(match){
                if(match[1].startsWith('http')){
                    let response = await fetch(match[1])
                    let data = await response.text()
                    scriptLua.push(data)                    
                }else if(match[1].startsWith('buss://')){
                    let url = await dnsResolve(match[1])
                    let response = await fetch(`${url.url}/${url.path}`)
                    let data = await response.text()
                    scriptLua.push(data)
                }else{
                    let response = await fetch(`${urlParts.url}/${urlParts.root}/${match[1]}`)
                    let data = await response.text()
                    scriptLua.push(data)
                }
                match = scriptSrcRegex.exec(data)
            }
            //suprime les string vides du tableau
            scriptLua = scriptLua.filter(e => e)
            console.log(scriptLua)
            //suprime les balises script
            data = replaceAllBalises(data, 'script')
            //execute tout les script lua
            scriptLua.forEach(e => {
                buss.lua(e)
            })
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
        //root est le chemin de l'url sans la ressource (ex: http://test.com/home/conection/index.html -> /home/conection)
        const path = url.split('://')[1].split('/').slice(1).join('/')||'/index.html'
        return {
            protocol: url.split('://')[0],
            url: "http://"+url.split('://')[1].split('/')[0],
            path,
            root: path.split('/').slice(0, -1).join('/')||'/'

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
    //root est le chemin de l'url sans la ressource (ex: http://test.com/home/conection/index.html -> /home/conection)

    return {
        protocol: protocol,
        url: response.ip,
        path: path||'/index.html',
        root: path.split('/').slice(0, -1).join('/')||'/'
    }

    
}


function replaceAllBalises(data, balise , replace = ""){
    //dectecte toute les balises (<balise>...</balise> ou <balise ... />) et les remplace par replace
    data=  data.replace(new RegExp(`<${balise}.*?>(.*?)</${balise}>`, 'g'), replace)
    data = data.replace(new RegExp(`<${balise}.*?/>`, 'g'), replace)
    return data
}