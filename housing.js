
var isClose = true;
const stopwords = ["of", "the", "a", "an", "any", "is", "can", "who", "what", "why", "whom", "from", "belongs"];
var editor = "sorts\n" +
    "    #apartment_name = {heritage, raiderpass}.\n" +
    "    #apartment_block = {blocka, blockb}.\n" +
    "    #room_number = {101,102,103,201,202,203}.\n" +
    "    #tenant_name = {selena, shakira, maheshbabu, jagan}.\n" +
    "    #apt_rooms = {onebhk, twobhk, threebhk}.\n" +
    "    #room_rates = {500, 800, 1200}.\n" +
    "    #room_mates = {3, 5, 7}.\n" +
    "    #tenant_gender = {male,female}.\n" +
    "predicates\n" +
    "    apartmentblock(#room_number, #apartment_block).\n" +
    "    apartmentrent(#apt_rooms, #room_rates).\n" +
    "    tenantname(#apartment_name, #tenant_name).\n" +
    "    tenantgender(#apartment_name, #tenant_gender, #tenant_name).\n" +
    "    tenantapt(#tenant_name, #room_number).\n" +
    "    numberofroommates(#apt_rooms, #room_mates).\n" +
    "    gender(#tenant_name, #tenant_gender).\n" +
    "rules\n" +
    "    apartmentblock(101, blocka).\n" +
    "    apartmentblock(102, blocka).\n" +
    "    apartmentblock(103, blocka).\n" +
    "    apartmentblock(201, blockb).\n" +
    "    apartmentblock(202, blockb).\n" +
    "    apartmentblock(203, blockb).\n" +
    "    apartmentrent(onebhk, 500).\n" +
    "    apartmentrent(twobhk, 800).\n" +
    "    apartmentrent(threebhk, 1200).\n" +
    "    tenantname(heritage,selena).\n" +
    "    tenantname(raiderpass,jagan).\n" +
    "    gender(selena, female).\n" +
    "    gender(maheshbabu, male).\n" +
    "    gender(jagan, male).\n" +
    "    gender(shakira, female).\n" +
    "    tenantapt(selena,101).\n" +
    "    tenantapt(Shakira,102).\n" +
    "    tenantapt(Maheshbabu,201).\n" +
    "    tenantapt(jagan,202).\n" +
    "    numberofroommates(onebhk,3).\n" +
    "    numberofroommates(twobhk,5).\n" +
    "    numberofroommates(threebhk,7).\n" +
    "    tenantgender(heritage, female, selena).\n" +
    "    tenantgender(raiderpass, male, maheshbabu).";

var contstring = editor.split("sorts\n")[1].split("predicates\n");
var sortstring = contstring[0].split('.');
sortstring.splice(-1, 1);
var sorts = {};
sortstring = sortstring.map(d => d.replace(/\n/g, '').trim()).forEach(d => {
    var par = d.split("=");
    sorts[par[0].replace(/#/, '').trim()] = par[1].replace(/{|}/g, '').split(',').map(w => w.trim())
});
// predicates
var predicates = {};
contstring = contstring[1].split("rules\n");
sortstring = contstring[0].split('.');
sortstring.splice(-1, 1);
sortstring.forEach(d => {
    var part = d.replace(/\n/g, '').trim().split('(');
    var func = part[0];
    predicates[func] = {};
    var par = part[1].split(',').map(e => e.replace(/#|\)/g, '').trim());
    var par1 = sorts[par[0]].slice();
    par1.push("X");
    par.splice(0, 1);
    par1.forEach(e => {
        var strinh = (e == 'X' ? '' : (e + ' ')) + func;
        predicates[func][strinh] = func + "(" + e + ")";
        par.forEach(par2 => {
            var temp = sorts[par2].slice();
            temp.push("X");
            temp.forEach(t => {
                var strinh = (e == 'X' ? '' : (e + ' ')) + func + (t == 'X' ? '' : (' ' + t));
                // if (strinh != fubnc)
                predicates[func][strinh] = func + "(" + e + "," + t + ")";
            })
        });
    });
});


var all_predicates = [];
for (var key1 in predicates) {
    if (predicates.hasOwnProperty(key1)) {
        for (var key2 in predicates[key1]) {
            if (predicates[key1].hasOwnProperty(key2))
                all_predicates.push(key2);
        }
    }

}
// all_predicates.push('speak spanish'); // extra terms
a = FuzzySet(all_predicates);

console.log(all_predicates)


// Speech recognition API
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();
recognition.lang = 'en-US';

// Get DOM elements
const answerDiv = document.querySelector('#answer');
const voiceBtn = document.getElementById('voice-input-btn');
const textInput = document.getElementById('text-input');
const submitBtn = document.getElementById('submit-btn');
const answerBox = document.getElementById('answer-box');

submitBtn.addEventListener('click', () => {
    const question = textInput.value;
    if (question.trim() === '') {
        answerBox.innerHTML = 'Please ask a question.';
        return;
    }
    var trim_script = question.split(" ");
    trim_script = trim_script.filter(f => !stopwords.includes(f));
    var queryQues = a.get(trim_script.join(" "), null, 0.5);
    getAnswer(queryQues);

});

// Handle speech recognition
recognition.onresult = event => {
    const resultIndex = event.resultIndex;
    const transcript = event.results[resultIndex][0].transcript;
    textInput.value = transcript;

    var trim_script = transcript.split(" ");
    trim_script = trim_script.filter(f => !stopwords.includes(f));
    var queryQues = a.get(trim_script.join(" "), null, 0.5);
    console.log(queryQues);
    getAnswer(queryQues);
};

// Handle click on voice input button     
function startSpeechRecognition() {
    recognition.start();
}
voiceBtn.addEventListener('click', startSpeechRecognition);


function getAnswer(question) {

    if (question != null) {
        var mainkey = question[0][1].replace('speak ', '');
        var answerarr = mainkey.split(' ');
        var key1 = '';
        answerarr.forEach(d => {
            key1 = (predicates[d] != undefined) ? d : key1;
        });
        //var key1 = answerarr.length>2? answerarr[1]:answerarr[0];
        var key2 = mainkey;
        console.log(key1 + '-' + key2);
        console.log(predicates[key1][key2]);

        var data = {
            'action': "getQuery",
            'query': predicates[key1][key2],
            'editor': editor
        };

        console.log(data)



        $.ajax({
            url: "https://cors-anywhere.herokuapp.com/http://wave.ttu.edu/ajax.php",
            type: "POST",
            headers: {
                "X-Requested-With": "XMLHttpRequest"
            },
            data: {
                action: "getQuery",
                query: predicates[key1][key2],
                editor: editor
            },
            success: function (response) {
                console.log(response);
                const answer = response || 'Sorry, I could not find an answer.';
                answerDiv.innerHTML = answer;
                answerBox.innerHTML = answer;
            },
            error: function (xhr, status, error) {
                console.log("error: " + error);
            }
        });


    }
    else {
        const answer = 'Sorry, I could not find an answer.';
        answerDiv.innerHTML = answer;
        answerBox.innerHTML = answer;
    }
}

