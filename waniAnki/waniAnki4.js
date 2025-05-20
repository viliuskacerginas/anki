// @name             WaniAnki
// @version          3.0
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
  kanji: "",
  grade: 0,
  stroke_count: 0,
  meanings: ["Unknown"],
  kun_readings: ["N/A"],
  on_readings: ["N/A"],
  name_readings: ["N/A"],
  jlpt: null,
  unicode: "4e11",
  heisig_en: "sign of the cow",
};

wkBlank = {
  level: "",
  slug: "",
  document_url: "",
  characters: "NOPE",
  meanings: [
    {
      meaning: "",
    },
  ],
  readings: [
    {
      type: "onyomi",
      reading: "",
    },
    {
      type: "kunyomi",
      reading: "",
    },
  ],
  component_subject_ids: [],

  meaning_mnemonic: "",
};
kanjiInfo = document.getElementById("kanjiInfo");
kanjiInfo.classList.add("kanjiInfo");
kanjiInfo.setAttribute("lang", "ja-jp");
kanjiBreakdown();

/**
 * This method starts the process by getting the kanji information from WaniKani API.
 * @main
 */
async function kanjiBreakdown() {
  var jsKanji = await localJSON("kanji");
  kanji = kanji.replace(
    /([ぁ-ゟ]+|[゠-ヿ]+|[!-~]+|[々〆〤「」]+|[！-￮]+|[\s*])/g,
    ""
  );
  kanjiArr = kanji.split("");
  k = kanjiArr.join(",");
  //console.log(k);}
  kanjiJS = wkBlank;
  sorted = sortKanji();
  //console.log(sorted);

  // Create a container for all kanji cards
  const kanjiContainer = document.createElement("div");
  kanjiContainer.classList.add("kanji-container");
  kanjiInfo.appendChild(kanjiContainer);

  // Track processed kanji to avoid duplicates
  const processedKanji = new Set();

  for (let i = 0; i < sorted.length; i++) {
    // Check if this kanji has already been processed
    if (!processedKanji.has(sorted[i].slug)) {
      await createKanji(sorted[i], jsKanji, kanjiContainer);
      // Mark this kanji as processed
      processedKanji.add(sorted[i].slug);
    }
  }
}

/**
 * This method calls local json files
 */
async function localJSON(end) {
  var js = "";
  await $.getJSON(
    "https://viliuskacerginas.github.io/anki/json/japanese/" + end + ".json",
    function (json) {
      js = json;
    }
  );
  return js;
}

/**
 * Method to sort the array returned by WaniKani API using the kanji contained within the vocab
 */
function sortKanji() {
  //console.log(kanjiJS);
  var index = 0;
  sortedKanji = new Array(kanjiArr.length);
  for (let i = 0; i < kanjiArr.length; i++) {
    for (let j = 0; j < kanjiJS.length; j++) {
      if (kanjiJS[j].data.slug == kanjiArr[i]) {
        sortedKanji[index] = kanjiJS[j].data;
      }
    }
    if (sortedKanji[index] == null) {
      noWK = new Object();
      Object.assign(noWK, wkBlank);
      noWK.slug = kanjiArr[i];
      sortedKanji[index] = noWK;
    }
    index++;
  }
  return sortedKanji;
}

/**
 * The main method that builds the html for the kanji within Anki
 * @param {object} data - the JSON data recovered from WK.
 * @param {object} jsKanji - JSON data for non-WK kanji
 * @param {HTMLElement} container - The container to append the kanji card to
 */
async function createKanji(data, jsKanji, container) {
  // Create a card for this kanji
  const card = document.createElement("div");
  card.classList.add("kanji-card");

  // Character/slug section
  const charSection = document.createElement("div");
  charSection.classList.add("kanji-char");

  // Meaning section
  const meaningSection = document.createElement("div");
  meaningSection.classList.add("kanji-meaning");

  // Readings section
  const readingsSection = document.createElement("div");
  readingsSection.classList.add("kanji-readings");

  var onyomi = "";
  var kunyomi = "";

  //This is for NON-WK Kanji
  if (data.characters === "NOPE") {
    code = "404";
    kanjiAPI = jsKanji[data.slug];
    //console.log(kanjiAPI);
    if (code === "404")
      data.document_url =
        "https://jisho.org/search/" + data.slug + "%20%23kanji";
    if (kanjiAPI == null) kanjiAPI = kanjiBlank;
    data.level = "<span class='jlpt'>JLPT n" + kanjiAPI.jlpt + "</span>";
    if (kanjiAPI.jlpt == null) {
      data.level = "<span class='jlpt'>n/a</span>";
    }
    var readings = { kun: kanjiAPI.kun_readings, on: kanjiAPI.on_readings };
    data.readings = readings;
    data.meanings = kanjiAPI.meanings;
    onyomi = readings["kun"].join(", ");
    kunyomi = readings["on"].join(", ");
  }

  // Add character/slug
  charSection.innerHTML =
    "<a href='" +
    data.document_url +
    "'><span class='slug'>" +
    data.slug +
    "</span></a>";
  card.appendChild(charSection);

  // Add meanings
  var meaning = "";
  for (let i = 0; i < data.meanings.length; i++) {
    if (data.meanings[i].meaning != null) {
      if (i == 0) {
        meaning = data.meanings[i].meaning;
      } else {
        meaning = meaning + ", " + data.meanings[i].meaning;
      }
    } else {
      if (i == 0) {
        meaning = data.meanings[i];
      } else {
        meaning = meaning + ", " + data.meanings[i];
      }
    }
  }
  meaningSection.innerHTML =
    "<a href='" +
    data.document_url +
    "'><span class='meaning'>" +
    meaning +
    "</span></a> " +
    data.level;
  card.appendChild(meaningSection);

  // Add readings
  o = 0;
  ku = 0;
  for (let i = 0; i < data.readings.length; i++) {
    if (data.readings[i].type == "onyomi") {
      if (o == 0) {
        onyomi = data.readings[i].reading;
        o++;
      } else {
        onyomi = onyomi + ", " + data.readings[i].reading;
      }
    }
    if (data.readings[i].type == "kunyomi") {
      if (ku == 0) {
        kunyomi = data.readings[i].reading;
        ku++;
      } else {
        kunyomi = kunyomi + ", " + data.readings[i].reading;
      }
    }
  }

  let readingsHTML = "";
  if (onyomi != "") {
    readingsHTML += "<div><strong>Kun:</strong> " + onyomi + "</div>";
  }
  if (kunyomi != "") {
    readingsHTML += "<div><strong>On:</strong> " + kunyomi + "</div>";
  }
  readingsSection.innerHTML = readingsHTML;
  card.appendChild(readingsSection);

  // Append card to container
  container.appendChild(card);
}
