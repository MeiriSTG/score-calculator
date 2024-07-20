function titleValueToIndex(value) {
  switch (value) {
    case "th6": return 0
    case "th7": return 1
    case "th8": return 2
    case "th10": return 3
    case "th11": return 4
    case "th12": return 5
    case "th12.5": return 6
    case "th13": return 7
    case "th14": return 8
    case "th15": return 9
    case "th16": return 10
    case "th17": return 11
    case "th18": return 12
    default: return 0
  }
}

function difficultValueToIndex(value) {
  switch (value) {
    case "Easy": return 0
    case "Normal": return 0
    case "Hard": return 1
    case "Lunatic": return 1
    case "Extra": return 2
    case "Phantasm": return 2
    case "NB": return 3
    case "NB+ FS": return 4
  }
}

function isWithPhanrasm(index) {
  return index === 1
}

function isWithNBFS(index) {
  return index === 4 || index === 7
}

function isNB(index) {
  return index === 3 || index === 4
}

function getLabelOfPhanrasm(index) {
  if (isWithPhanrasm(index)) {
    return "Phantasm"
  } else {
    return undefined
  }
}

function getLabelOfNBFS(index) {
  if (isWithNBFS(index)) {
    return "NB+ FS"
  } else {
    return undefined
  }
}

function wrapWithIf(tag, att, s) {
  if (s !== undefined)  {
    return "<" + tag + " " + att + ">" + s + "</" + tag + "th>"
  } else {
    return ""
  }
}

function getMinBaseScore(scores, difficultIndex) {
  return Math.min(...scores.map(item => item.score[difficultIndex]))
}

function formatNumber(num) {
    const str = num.toString();
    if (str.length === 1) {
        return '0.' + str;
    }
    return str.slice(0, -1) + '.' + str.slice(-1);
}


function round(n) {
  return Math.floor(n * 10000) / 10000
}

document.addEventListener("DOMContentLoaded", () => {
  const title = document.getElementById("title")
  const difficult = document.getElementById("difficult")
  const character = document.getElementById("character")
  const continuedOrGameOver = document.getElementById("continuedOrGameOver")
  const numericDesc = document.getElementById("numeric-desc")
  const numeric = document.getElementById("numeric")
  const numProgDesc = document.getElementById("numProg-desc")
  const numProg = document.getElementById("numProg")
  const scoreFomula = document.getElementById("score-fomula")
  const scoreResult = document.getElementById("score-result")
  const scoreTable = document.getElementById("score-table")
  const timeTable = document.getElementById("time-table")

  const calculate = () => {
    const titleIndex = titleValueToIndex(title.value)
    const difficultIndex = difficultValueToIndex(difficult.value)
    const characterIndex = Number(character.value)
    const isContinuedOrGameOver = continuedOrGameOver.value === "yes"
    const numericValue = Number(numeric.value)
    const baseScore = SCORES[titleIndex][characterIndex].score[difficultIndex]
    const minBaseScore = getMinBaseScore(SCORES[titleIndex], difficultIndex)
    if (isNB(difficultIndex)) {
      scoreFomula.innerText = ""
      scoreFomula.innerText += baseScore
      scoreFomula.innerText += "(1/2)^"
      scoreFomula.innerText += numericValue
      scoreFomula.innerText += " ="
      scoreResult.innerText = "" + round(baseScore * Math.pow(0.5, numericValue))
    } else if (isContinuedOrGameOver) {
      scoreFomula.innerText = minBaseScore + "*" + numProg + " ="
      scoreResult.innerText = "" + formatNumber(Math.floor(minBaseScore * numProg * 10))
    } else {
      scoreFomula.innerText = ""
      scoreFomula.innerText += baseScore
      scoreFomula.innerText += "*(1+"
      scoreFomula.innerText += numericValue
      scoreFomula.innerText += "/10)+"
      scoreFomula.innerText += minBaseScore
      scoreFomula.innerText += " ="
      scoreResult.innerText = "" + formatNumber(Math.floor((baseScore * (1 + 0.1 * numericValue) + minBaseScore) * 10))
    }
  }

  const onUpdateDifficult = () => {
    const titleIndex = titleValueToIndex(title.value)
    const difficultIndex = difficultValueToIndex(difficult.value)
    const scores = SCORES[titleIndex]

    if (difficult.value === "Easy" || difficult.value === "Normal") {
      continuedOrGameOver.style.display = "inline"
    } else {
      continuedOrGameOver.style.display = "none"
    }
    if (isNB(difficultIndex)) {
      numericDesc.innerText = "被弾数: "
      numProgDesc.style.display = "none"
      numProg.style.display = "none"
    } else {
      numericDesc.innerText = "残機数: "
      numProgDesc.style.display = "inline"
      numProg.style.display = "inline"
    }

    let characterInnerHTML = ""
    for (let i = 0; i < scores.length; ++i) {
      if (scores[i].score[difficultIndex] !== '-') {
        characterInnerHTML += wrapWithIf("option", "value='" + i + "'", scores[i].name)
      }
    }
    character.innerHTML = characterInnerHTML

    calculate()
  }

  const onUpdateTitle = () => {
    const index = titleValueToIndex(title.value)
    const scores = SCORES[index]
    const times = TIMES[index]

    // difficult
    let difficultInnerHTML = ""
    difficultInnerHTML += "<option>Easy</option>"
    difficultInnerHTML += "<option>Normal</option>"
    difficultInnerHTML += "<option>Hard</option>"
    difficultInnerHTML += "<option>Lunatic</option>"
    difficultInnerHTML += "<option>Extra</option>"
    difficultInnerHTML += wrapWithIf("option", "", getLabelOfPhanrasm(index))
    difficultInnerHTML += "<option>NB</option>"
    difficultInnerHTML += wrapWithIf("option", "", getLabelOfNBFS(index))
    difficult.innerHTML = difficultInnerHTML

    // character
    let characterInnerHTML = ""
    for (let i = 0; i < scores.length; ++i) {
      if (scores[i].score[difficultValueToIndex(difficult.value)] !== '-') {
        characterInnerHTML += wrapWithIf("option", "value='" + i + "'", scores[i].name)
      }
    }
    character.innerHTML = characterInnerHTML

    // score-table
    let scoreTableInnerHTML = ""
    // 1. head
    scoreTableInnerHTML += "<tr>"
    scoreTableInnerHTML += "<th></th><th>Easy, Normal</th><th>Hard, Lunatic</th>"
    scoreTableInnerHTML += (isWithPhanrasm(index) ? "<th>Extra, Phantasm</th>" : "<th>Extra</th>")
    scoreTableInnerHTML += "<th>NB</th>"
    scoreTableInnerHTML += wrapWithIf("th", "", getLabelOfNBFS(index))
    scoreTableInnerHTML += "</tr>"
    // 2. body
    for (const score of scores) {
      scoreTableInnerHTML += "<tr>"
      scoreTableInnerHTML += "<td>" + score.name + "</td>"
      for (const n of score.score) {
        scoreTableInnerHTML += "<td>" + n + "</td>"
      }
      scoreTableInnerHTML += "</tr>"
    }
    // 3. assign
    scoreTable.innerHTML = scoreTableInnerHTML

    // time-table
    let timeTableInnerHTML = ""
    // 1. head
    timeTableInnerHTML += "<tr>"
    timeTableInnerHTML += "<th>Easy</th><th>Normal</th><th>Hard, Lunatic</th><th>Extra</th>"
    if (index === 1) {
      timeTableInnerHTML += "<th>Phantasm</th>"
    }
    timeTableInnerHTML += "<th>NB</th>"
    timeTableInnerHTML += "</tr>"
    // 2. body
    timeTableInnerHTML += "<tr>"
    for (const time of times) {
      if (time !== undefined) {
        timeTableInnerHTML += "<td>" + time + "</td>"
      }
    }
    timeTableInnerHTML += "</tr>"
    // 3. assign
    timeTable.innerHTML = timeTableInnerHTML

    onUpdateDifficult()
  }

  onUpdateTitle()

  title.addEventListener("change", onUpdateTitle)
  difficult.addEventListener("change", onUpdateDifficult)
  character.addEventListener("change", calculate)
  continuedOrGameOver.addEventListener("change", calculate)
  numeric.addEventListener("change", calculate)
})
