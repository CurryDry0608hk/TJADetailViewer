let showBPM = document.getElementById("showBPM");
let showHS = document.getElementById("showHS");
let showBeat = document.getElementById("showBeat");
let showBar = document.getElementById("showBar");
let showGogo = document.getElementById("showGogo");
let backgroundColorInput = document.getElementById("backgroundColor");
let textColorInput = document.getElementById("textColor");
let textSizeInput = document.getElementById("textSize");
let fontNameInput = document.getElementById("fontName");
let rowPaddingInput = document.getElementById("rowPadding");
let fileInput = document.getElementById("audioFile");
let tjaDataTextArea = document.getElementById("tjaData");
let showArea = document.getElementById('showArea');
let rowValue = document.getElementsByClassName('rowValue');
let rowBPM = document.getElementById('rowBPM');
let rowHS = document.getElementById('rowHS');
let rowBeat = document.getElementById('rowBeat');
let rowBar = document.getElementById('rowBar');
let rowGogo = document.getElementById('rowGogo');
let rowBPMValue = document.getElementById('rowBPMValue');
let rowHSValue = document.getElementById('rowHSValue');
let rowBeatValue = document.getElementById('rowBeatValue');
let rowBarValue = document.getElementById('rowBarValue');
let rowGogoValue = document.getElementById('rowGogoValue');
let playButton = document.getElementById('playButton');
let stopButton = document.getElementById('stopButton');

let loop;

let totalSecond = 0;
let currentSecond = 0;
let startTime = 0;

let currentIndexBPM = 0;
let currentIndexHS = 0;
let currentIndexBeat = 0;
let currentIndexBar = 0;
let currentIndexGogo = 0;

//音源ファイル
let audio = new Audio();
audio.volume = 0.5;

//タイミングを格納する配列
let timeBPM = [];
let timeHS = [];
let timeBeat = [];
let timeBar = [];
let timeGogo = [];

//タイミングオブジェクトを作成する関数
function timeObj(time, value){
    return obj = {
        time: time,
        value: value
    }
}

//イベントリスナー
showBPM.addEventListener('change', showRowChange);
showHS.addEventListener('change', showRowChange);
showBeat.addEventListener('change', showRowChange);
showBar.addEventListener('change', showRowChange);
showGogo.addEventListener('change', showRowChange);
backgroundColorInput.addEventListener('change', showRowChange);
textColorInput.addEventListener('change', showRowChange);
textSizeInput.addEventListener('change', showRowChange);
fontNameInput.addEventListener('change', showRowChange);
rowPaddingInput.addEventListener('change', showRowChange);
fileInput.addEventListener('change', loadAudioFile);
tjaDataTextArea.addEventListener('change', loadTJAData);



//表示欄の更新
function showRowChange(){
    //表示項目の更新
    rowBPM.style.display = showBPM.checked ? "block" : "none";
    rowHS.style.display = showHS.checked ? "block" : "none";
    rowBeat.style.display = showBeat.checked ? "block" : "none";
    rowBar.style.display = showBar.checked ? "block" : "none";
    rowGogo.style.display = showGogo.checked ? "block" : "none";

    //入力内容の取得
    let backgroundColor = backgroundColorInput.value;
    let textColor = textColorInput.value;
    let textSize = textSizeInput.value;
    let fontName = fontNameInput.value;
    let rowPadding = rowPaddingInput.value;

    //見た目の更新
    showArea.style.backgroundColor = backgroundColor;
    showArea.style.color = textColor;
    showArea.style.fontSize = textSize + "px";
    showArea.style.fontFamily = "'" + fontName + "'";
    Array.from(rowValue).forEach(element => {element.style.padding = rowPadding + "px 0px"});
}

//音源ファイル読み込み
function loadAudioFile(){
    if (fileInput.files.length > 0) {
        const file = fileInput.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            audio.pause();
            audio.src = reader.result;
        };
        reader.readAsDataURL(file);
    }
}

//譜面データ読み込み
function loadTJAData(){

    //タイミングのリセット
    timeBPM = [];
    timeHS = [];
    timeBeat = [];
    timeBar = [];
    timeGogo = [];

    //譜面データの取得
    let tjaData = tjaDataTextArea.value.replace(/\r\n|\r/g, "\n");

    //譜面データを配列に分割
    let tjaArray = tjaData.split("\n");



    ////譜面データをタイミングに変換

    //変数と初期値の準備
    let nowBPM = (new RegExp(/^BPM:(-?\d+(?:\.\d+)?)/m)).exec(tjaData)[1];
    let nowHS = 1;
    let nowBeat = 1;
    let nowBeatNum = 4;
    let nowBeatDenom = 4;
    let isShowBar = true;
    let isGogo = false;
    let offset = (new RegExp(/^OFFSET:(-?\d+(?:\.\d+)?)/m)).exec(tjaData)[1];
    let tmpTime = offset * -1;
    let isMeasureHead = true;
    let nowNotes = 0;
    let nowTotalNotes = 0;
    let isHSChanged = false;
    let isBeatChanged = false;
    let sort = true;

    //表示欄に初期値を表示
    rowBPMValue.innerText = nowBPM;
    rowHSValue.innerText = "　";
    rowBeatValue.innerText = "　";
    rowBarValue.innerText = "表示";
    rowGogoValue.innerText = "非ゴーゴー";

    //初期値のタイミングを記録
    timeBPM.push(timeObj(-1000000, nowBPM));
    timeHS.push(timeObj(-1000000, "　"));
    timeBeat.push(timeObj(-1000000, "　"));
    timeBar.push(timeObj(-1000000, "表示"));
    timeGogo.push(timeObj(-1000000, "非ゴーゴー"));

    //#STARTの位置を検索
    let startIndex = 0;
    for(let i = 0; i < tjaArray.length; i++){
        if((new RegExp(/^#START/)).test(tjaArray[i])){
            startIndex = i;
            break;
        }
    }

    //#STARTから最後までループ
    for(let i = startIndex; i < tjaArray.length; i++){
        //配列の要素を一時変数に保存
        let tmpStr = tjaArray[i];

        //#BPMCHANGEの場合
        if((new RegExp(/^#BPMCHANGE -?\d+(?:\.\d+)?/)).test(tmpStr)){
            //現在のBPMを変更
            nowBPM = (new RegExp(/^#BPMCHANGE (-?\d+(?:\.\d+)?)/)).exec(tmpStr)[1];
            //タイミングを記録
            timeBPM.push(timeObj(tmpTime, nowBPM));
        }

        //#SCROLLの場合
        if((new RegExp(/^#SCROLL -?\d+(?:\.\d+)?/)).test(tmpStr)){
            //現在のHSを変更
            nowHS = (new RegExp(/^#SCROLL (-?\d+(?:\.\d+)?(?:(?:\+|-)\d+(?:\.\d+)?)?i?)/)).exec(tmpStr)[1];
            //タイミングを記録
            timeHS.push(timeObj(tmpTime, nowHS));
            //フラグを立てる
            isHSChanged = true;
        }

        //#MEASUREの場合
        if((new RegExp(/^#MEASURE -?\d+(?:\.\d+)?\/\d+(?:\.\d+)?/)).test(tmpStr)){
            //現在のBeatを変更
            let match = (new RegExp(/^#MEASURE (-?\d+(?:\.\d+)?)\/(\d+(?:\.\d+)?)/)).exec(tmpStr);
            nowBeatNum = match[1];
            nowBeatDenom = match[2];
            nowBeat = nowBeatNum / nowBeatDenom;
            //タイミングを記録
            timeBeat.push(timeObj(tmpTime, nowBeatNum + "/" + nowBeatDenom));
            //フラグを立てる
            isBeatChanged = true;
        }

        //#BARLINEON,#BARLINEOFFの場合
        if((new RegExp(/^#BARLINE(ON|OFF)/)).test(tmpStr)){
            //現在のisShowBarを変更
            match = (new RegExp(/^#BARLINE(ON|OFF)/)).exec(tmpStr)[1];
            isShowBar = (match == "ON") ? true : false;
            //タイミングを記録
            timeBar.push(timeObj(tmpTime, (match == "ON") ? "表示" : "非表示"));
        }

        //#GOGOSTART,#GOGOENDの場合
        if((new RegExp(/^#GOGO(START|END)/)).test(tmpStr)){
            //現在のisGogoを変更
            match = (new RegExp(/^#GOGO(START|END)/)).exec(tmpStr)[1];
            isGogo = (match == "START") ? true : false;
            //タイミングを記録
            timeGogo.push(timeObj(tmpTime, (match == "START") ? "ゴーゴー" : "非ゴーゴー"));
        }

        //#DELAYの場合
        if((new RegExp(/^#DELAY -?\d+(?:\.\d+)?/)).test(tmpStr)){
            //タイミングに加算
            tmpTime += (new RegExp(/^#DELAY (-?\d+(?:\.\d+)?)/)).exec(tmpStr)[1] * 1;
        }

        //コンマありの場合
        if((new RegExp(/^\d*,/)).test(tmpStr)){
            //今まで変化がなければ
            if(!isHSChanged){
                //タイミングを記録
                timeHS.push(timeObj(tmpTime, nowHS));
            }
            if(!isBeatChanged){
                //タイミングを記録
                timeBeat.push(timeObj(tmpTime, nowBeatNum + "/" + nowBeatDenom));
            }

            //小節の頭なら
            if(isMeasureHead){
                //秒数を計算してタイミングに加算
                tmpTime += (240.0 / nowBPM) * nowBeat;
            }
            //小節の頭でないなら
            else{
                //音符数を数える
                nowNotes = (new RegExp(/^\d+/)).exec(tmpStr)[0].length;
                //秒数を計算してタイミングに加算
                tmpTime += (240.0 / nowBPM) * nowBeat * (nowNotes / nowTotalNotes);
            }
            //次の音符は小節頭
            isMeasureHead = true;
        }

        //コンマなしの場合(音符のみの場合)
        if((new RegExp(/^\d+/)).test(tmpStr) && !(new RegExp(/^\d*,/)).test(tmpStr)){
            //今まで変化がなければ
            if(!isHSChanged){
                //タイミングを記録
                timeHS.push(timeObj(tmpTime, nowHS));
            }
            if(!isBeatChanged){
                //タイミングを記録
                timeBeat.push(timeObj(tmpTime, nowBeatNum + "/" + nowBeatDenom));
            }
            
            //小節の頭なら
            if(isMeasureHead){
                //nowTotalNotesをリセット
                nowTotalNotes = 0;
                ////1小節の総音符数を数える
                //一番近いコンマを検索
                let nextComma = tjaArray.length;
                for(let j = i; j < tjaArray.length; j++){
                    if((new RegExp(/^\d*,/)).test(tjaArray[j])){
                        nextComma = j;
                        break;
                    }
                }
                //総音符数を数える
                for(let j = i; j <= nextComma; j++){
                    if((new RegExp(/^\d+/)).test(tjaArray[j])){
                        nowTotalNotes += (new RegExp(/^\d+/)).exec(tjaArray[j])[0].length;
                    }
                }
            }
            //音符数を数える
            nowNotes = (new RegExp(/^\d+/)).exec(tmpStr)[0].length;
            //秒数を計算してタイミングに加算
            tmpTime += (240.0 / nowBPM) * nowBeat * (nowNotes / nowTotalNotes);
            //次の音符は小節頭ではない
            isMeasureHead = false;
        }

        //#ENDの場合
        if((new RegExp(/^#END/)).test(tmpStr)){
            //totalSecondに記録
            totalSecond = tmpTime;
            //コンソールに演奏時間を出力
            console.log("演奏時間：" + totalSecond + "秒");
        }
    }

    //ソート
    if(sort){
        timeBPM.sort((a, b) => a.time > b.time ? 1 : -1);
        timeHS.sort((a, b) => a.time > b.time ? 1 : -1);
        timeBeat.sort((a, b) => a.time > b.time ? 1 : -1);
        timeBar.sort((a, b) => a.time > b.time ? 1 : -1);
        timeGogo.sort((a, b) => a.time > b.time ? 1 : -1);
    }

    //再生ボタンを有効化
    playButton.disabled = false;
}






//再生ボタン
function playButtonClicked(){
    //停止ボタンに変更
    playButton.style.display = "none";
    stopButton.style.display = "inline-block";

    //音源を再生
    if(audio.src != "") {
        audio.play();
    }

    //開始時間を記録
    startTime = Date.now();

    //indexをリセット
    currentIndexBPM = 0;
    currentIndexHS = 0;
    currentIndexBeat = 0;
    currentIndexBar = 0;
    currentIndexGogo = 0;

    //表示欄の内容更新処理を実行
    showAreaUpdate();
}

//停止ボタン
function stopButtonClicked(){
    //再生ボタンに変更
    playButton.style.display = "inline-block";
    stopButton.style.display = "none";

    //音源の再生を停止
    if(!audio.paused){
        audio.pause();
        audio.currentTime = 0;
    }

    //表示欄を初期値に戻す
    if(currentSecond < totalSecond){
        rowBPMValue.innerText = timeBPM[0].value;
        rowHSValue.innerText = timeHS[0].value;
        rowBeatValue.innerText = timeBeat[0].value;
        rowBarValue.innerText = timeBar[0].value;
        rowGogoValue.innerText = timeGogo[0].value;
    }

    //表示欄の内容更新処理を停止
    cancelAnimationFrame(loop);
}

//表示欄の内容更新処理
function showAreaUpdate(){
    //現在の時間を取得
    let nowTime = Date.now();
    //経過時間を計算
    currentSecond = (nowTime - startTime) / 1000;

    //現在の値を求める
    for(let i = currentIndexBPM; i < timeBPM.length; i++){
        if(timeBPM[i].time < currentSecond)
            currentIndexBPM = i;
    }
    for(let i = currentIndexHS; i < timeHS.length; i++){
        if(timeHS[i].time < currentSecond)
            currentIndexHS = i;
    }
    for(let i = currentIndexBeat; i < timeBeat.length; i++){
        if(timeBeat[i].time < currentSecond)
            currentIndexBeat = i;
    }
    for(let i = currentIndexBar; i < timeBar.length; i++){
        if(timeBar[i].time < currentSecond)
            currentIndexBar = i;
    }
    for(let i = currentIndexGogo; i < timeGogo.length; i++){
        if(timeGogo[i].time < currentSecond)
            currentIndexGogo = i;
    }

    //表示欄の要素を更新
    rowBPMValue.innerText = timeBPM[currentIndexBPM].value;
    rowHSValue.innerText = timeHS[currentIndexHS].value;
    rowBeatValue.innerText = timeBeat[currentIndexBeat].value;
    rowBarValue.innerText = timeBar[currentIndexBar].value;
    rowGogoValue.innerText = timeGogo[currentIndexGogo].value;

    //経過時間が演奏時間を超えたら
    if(currentSecond >= totalSecond){
        //HSと拍子は非表示
        rowBPMValue.innerText = timeBPM[currentIndexBPM].value;
        rowHSValue.innerText = timeHS[0].value;
        rowBeatValue.innerText = timeBeat[0].value;
        rowBarValue.innerText = timeBar[currentIndexBar].value;
        rowGogoValue.innerText = timeGogo[currentIndexGogo].value;
        //再生の停止
        stopButtonClicked();
    }
    //超えていなければループ
    else{
        loop = requestAnimationFrame(showAreaUpdate);
    }
}