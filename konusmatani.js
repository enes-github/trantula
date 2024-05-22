document.addEventListener('DOMContentLoaded', function () {
    const toggleButton = document.getElementById('mik');
    const output = document.getElementById('tani');
    const translatedOutput = document.getElementById('cevir');
    const languageSelect = document.getElementById('language');
    const translateLanguageSelect = document.getElementById('language-c');
    document.body.style.fontFamily = '"Open Sans", sans-serif';
    var renk = document.getElementById('mik');

    let recognition;
    let isRecognizing = false;
    let finalTranscript = '';

    window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if ('SpeechRecognition' in window) {
        recognition = new SpeechRecognition();
    }
    else {
        alert('Chromium tabanlı bir web tarayıcı kullan!');
    };

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = languageSelect.value;

    recognition.onresult = function (event) {
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
            if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript + ' ';
            } else {
                interimTranscript += event.results[i][0].transcript;
            }
        }
        output.innerHTML = finalTranscript + '<i style="color:#ccc;">' + interimTranscript + '</i>';
        console.log('Interim Transcript: ', interimTranscript);
        console.log('Final Transcript: ', finalTranscript);
    };

    recognition.onerror = function (event) {
        console.error('Speech recognition error: ' + event.error);
        isRecognizing = false;
    };

    recognition.onend = function () {
        isRecognizing = false;
        console.log('Recognition ended. Final transcript:', finalTranscript);
        if (finalTranscript.trim() !== '') {
            translateText(finalTranscript, translateLanguageSelect.value);
        }
    };

    toggleButton.addEventListener('click', function () {
        if (isRecognizing) {
            recognition.stop();
            renk.style.backgroundColor = "#FFAC1C";
        } else {
            recognition.lang = languageSelect.value;
            finalTranscript = '';  
            recognition.start();
            renk.style.backgroundColor = "#fd5c63";
        }
        isRecognizing = !isRecognizing;
    });

    function translateText(text, targetLanguage) {
        const subscriptionKey = '0c50eb8ae89c4bd5b95350aac839c325';
        const endpoint = 'https://crazy-lover.cognitiveservices.azure.com';
        const url = `${endpoint}/translator/text/v3.0/translate?api-version=3.0&to=${targetLanguage}`;

        const headers = new Headers({
            'Ocp-Apim-Subscription-Key': subscriptionKey,
            'Content-type': 'application/json'
        });

        const body = JSON.stringify([{ Text: text }]);

        console.log('Sending translation request:', body);

        fetch(url, {
            method: 'POST',
            headers: headers,
            body: body
        })
        .then(response => {
            console.log('Translation response status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('Translation response data:', data);
            if (data && data[0] && data[0].translations && data[0].translations[0]) {
                const translatedText = data[0].translations[0].text;
                translatedOutput.textContent = translatedText;
                console.log('Translated text:', translatedText);
            } else {
                console.error('Translation response format is incorrect:', data);
            }
        })
        .catch(error => console.error('Error translating text:', error));
    }
});
