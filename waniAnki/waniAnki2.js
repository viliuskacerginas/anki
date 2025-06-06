// @name             WaniAnki
// @version          2.0
// @description      Displays using Javascript the kanji information for the given vocabulary word. 
// @author           https://www.reddit.com/user/Damshh
// @license          MIT
// @credits 		 Thanks to WaniKani, https://kanjiapi.dev/, jisho.org, and KanjiDamage for all of this. 
    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */

kanjiBlank = {
    "kanji": "",
    "grade": 0,
    "stroke_count": 0,
    "meanings": [
        "Unknown"
    ],
    "kun_readings": [
        "N/A"
    ],
    "on_readings": [
        "N/A"
    ],
    "name_readings": [
        "N/A"
    ],
    "jlpt": null,
    "unicode": "4e11",
    "heisig_en": "sign of the cow"
};	

wkBlank = {
    "level": "",
    "slug": "",
    "document_url": "",
    "characters": "NOPE",
    "meanings": [
        {
            "meaning": "",
        }
    ],
    "readings": [
        {
            "type": "onyomi",
            "reading": "",
        },
        {
            "type": "kunyomi",
            "reading": "",
        }
    ],
    "component_subject_ids": [],

    "meaning_mnemonic": "",
};
kanjiInfo = document.getElementById('kanjiInfo');
kanjiInfo.classList.add("kanjiInfo");
kanjiInfo.setAttribute("lang", "ja-jp");
kanjiBreakdown();


/**
 * This method starts the process by getting the kanji information from WaniKani API. 
 * @main 
 */
async function kanjiBreakdown(){
	var jsKanji = await localJSON("kanji");
	kanji = kanji.replace(/([ぁ-ゟ]+|[゠-ヿ]+|[!-~]+|[々〆〤「」]+|[！-￮]+|[\s*])/g, '');
	kanjiArr = kanji.split("");
	k = kanjiArr.join(",");
	//console.log(k);}
	kanjiJS = wkBlank;
	sorted = sortKanji();
	//console.log(sorted);
	for(let i = 0; i < sorted.length; i++){
		await createKanji(sorted[i],jsKanji);
	}
}

/**
 * This method calls local json files
 */ 
async function localJSON(end){
	var js = "";
	await $.getJSON("https://viliuskacerginas.github.io/anki/json/japanese/" + end + ".json", function(json) {
		js = json;
	});			
	return js;
}


/**
 * Method to sort the array returned by WaniKani API using the kanji contained within the vocab
 */
function sortKanji(){
	//console.log(kanjiJS);
	var index=0;
	sortedKanji = new Array(kanjiArr.length);
	for(let i=0;i<kanjiArr.length;i++){
		for(let j = 0;j<kanjiJS.length;j++){
			if(kanjiJS[j].data.slug==kanjiArr[i]){
				sortedKanji[index]=kanjiJS[j].data;
			}
		}
		if(sortedKanji[index]==null){
			noWK = new Object();
			Object.assign(noWK, wkBlank);
			noWK.slug =kanjiArr[i];
			sortedKanji[index]=noWK;			
		}
		index++;
	}
	return sortedKanji;
}


/**
 * The main method that builds the html for the kanji within Anki
 * @param {object} data - the JSON data recovered from WK. 
 */
async function createKanji(data,jsKanji,allRadicals){
	//console.log(data);
	const grid = document.createElement('div');
	grid.classList.add('grid-container');
	//divs for items
	const item1 = document.createElement('div');
	const item2 = document.createElement('div');
	const item4 = document.createElement('div');
	
	//class for items
	item1.classList.add('item1');
	item2.classList.add('item2');
	item4.classList.add('item4');
	
	//readings p 
	const on = document.createElement('p');
	const kun = document.createElement('p');
	const onR = document.createElement('p');
	const kunR = document.createElement('p');
	var onyomi = "";
	var kunyomi = "";
	on.innerHTML = "<p><strong>Kun’yomi:</strong></p>";
	kun.innerHTML = "<p><strong>On’yomi:</strong></p>";
	
	//This is for NON-WK Kanji
	if(data.characters === 'NOPE'){
		code = "404";
		kanjiAPI = jsKanji[data.slug];
		//console.log(kanjiAPI);
		if(code==="404") data.document_url="https://jisho.org/search/" + data.slug + "%20%23kanji";
		if(kanjiAPI==null) kanjiAPI =kanjiBlank;
		data.level = "<br><jlpt><span title='jlpt level'>JLPT n" + kanjiAPI.jlpt + "</span></jlpt>";
		if(kanjiAPI.jlpt==null){
			data.level="<br><jlpt><span title='jlpt level'>n/a</span></jlpt>"
		}
		var readings = {kun:kanjiAPI.kun_readings, on:kanjiAPI.on_readings};
		data.readings = readings;
		data.meanings=kanjiAPI.meanings;
		onyomi = readings["kun"].join(", ");
		kunyomi = readings["on"].join(", ");
		
		//console.log(data.slug + " no esta en WK");
	}
	
	
	//Add Content
	//item 1 - meaning
	var meaning = ""
	for (let i = 0; i < data.meanings.length; i++) {
			if(data.meanings[i].meaning!=null){
				if(i==0){
					meaning = "<kanji>" + data.meanings[i].meaning + "</kanji>";
				}
				else{
					meaning = meaning + ", " + "<kanji>" + data.meanings[i].meaning + "</kanji>";
				}
			}
			else{
				if(i==0){
					meaning = "<kanji>" + data.meanings[i] + "</kanji>";
				}
				else{
					meaning =  meaning + ", " + "<kanji>" + data.meanings[i] + "</kanji>";
				}
			}
	}
	item1.innerHTML = "<a href='" + data.document_url + "'>" + meaning +  "</a> " + data.level;
	
	
	
	//item 2 - slug
	item2.innerHTML = "<a href='" + data.document_url + "'><slug>" +  data.slug + "</slug></a>"
	
	//item 3 - radicals
	for (let i = 0; i < data.component_subject_ids.length; i++) {
				createRadical(allRadicals["wk" + data.component_subject_ids[i]].data,item3,i);
	}

	//item 4 - readings
	o = 0;
	ku = 0;
	//console.log(data.readings.length);
	for (let i = 0; i < data.readings.length; i++) {
		if(data.readings[i].type=="onyomi"){
			if(o==0){
				onyomi = data.readings[i].reading;
				o++;
			}
			else{
				onyomi = onyomi + ", " + data.readings[i].reading;
			}
		}
		if(data.readings[i].type=="kunyomi"){
			if(ku==0){
				kunyomi = data.readings[i].reading;
				ku++;
			}
			else{
				kunyomi = kunyomi + ", " + data.readings[i].reading;
			}
		}
	}
	if(onyomi!=""){
		onR.innerHTML = onyomi;
		on.appendChild(onR);
		item4.appendChild(on);
	}
	if(kunyomi!=""){
		kunR.innerHTML = kunyomi;
		kun.appendChild(kunR);
		item4.appendChild(kun);
	}

	//append to grid
	grid.appendChild(item1);
	grid.appendChild(item2);
	grid.appendChild(item4);
	
	
	//console.log(data);
	//append grid to kanjiinfo
	kanjiInfo.appendChild(grid);
	lineaBreak = document.createElement("br");
	kanjiInfo.appendChild(lineaBreak);
}


