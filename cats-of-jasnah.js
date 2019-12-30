const COLOR_ATTS = ['red', 'blue', 'yellow']
const MOTION_ATTS = ['bouncing', 'spinning']
const ANIMAL_ATTS = ['ducks']
const ALL_ATTS = COLOR_ATTS.concat(MOTION_ATTS).concat(ANIMAL_ATTS)
let ATTS
let cur_atts = {}
let cur_level = 0
let clue
// var audio = new Audio();

const pick_rand = function(seq) {
  return seq[Math.floor(Math.random() * seq.length)]
}
const set_level = function(level) {
  // initialization
  $('.instructions').hide()
  $('#forkongithub').hide()
  $('.number-bar').show()
  $('.level-display').show()

  $('.level-number').text(level)
  cur_level = level
  make_cats()
}
// returns whether a given value is to be negated.
const level_get_negation = function(level) {
  if (level === 2) return false
  if (level === 6) return true
  if (level >= 5) return Math.random() > 0.4
  return true
}
const cats_for_level = function(level) {
  min_cats = level + 1
  max_cats = level + 5

  return Math.floor(Math.random() * (max_cats + 1 - min_cats)) + min_cats
}
const set_avail_atts = function() {
  if (cur_level == 0) {
    ATTS = []
  } else if (cur_level <= 2) {
    ATTS = [pick_rand(ALL_ATTS)]
  } else if (cur_level <= 5) {
    ATTS = [pick_rand(COLOR_ATTS), pick_rand(MOTION_ATTS)]
  } else {
    ATTS = [
      pick_rand(COLOR_ATTS),
      pick_rand(MOTION_ATTS),
      pick_rand(ANIMAL_ATTS)
    ]
  }
}
const get_level_num_adjectives = function(level, keys) {
  // get the number of categories used as adjectives, given a list of
  // categories. More is generally
  // easier.
  let pos = Math.floor(Math.random() * (keys.length + 1))
  if (level == 3) pos = keys.length // combination level
  if (level == 4) pos = 0 // conjunction level
  if (level < 7) {
    // all but one an adjective before level 7
    if (pos > keys.length - 1) {
      pos = keys.length - 1
    }
  } else {
    pos = 0
  }
  return pos
}
const permute_atts = function() {
  cur_atts = {}
  for (let i = 0; i < ATTS.length; i++) {
    if (Math.random() > 0.2) {
      cur_atts[ATTS[i]] = level_get_negation(cur_level)
    }
  }
}

const chance_for_level = function(level) {
  return 0.5 + Math.random() * (level / 40) // increased match chance as levels progress, sometimes.
}
const speak = function(text, opts) {
  opts = opts || {}
  $('p').text(text)
//   responsiveVoice.speak(text, 'US English Female', opts)
  var audio = new Audio()
  audio.src =`http://translate.google.com/translate_tts?ie=utf-8&tl=ur&q=${text}`
  audio.play();
}

var make_cats = function() {
  set_avail_atts()
  permute_atts()
  is_reversed = Math.random() < 0.5
  let text = 'how many '
  const keys = Object.keys(cur_atts)
  const prefix_pos = get_level_num_adjectives(cur_level, keys)
  const prefix_keys = keys.slice(0, prefix_pos)
  if (prefix_keys.length) {
    let prefix_words = []
    for (let att in prefix_keys) {
      prefix_words.push(
        (cur_atts[prefix_keys[att]] ? '' : 'not-') + prefix_keys[att]
      )
    }
    text += prefix_words.join(', ') + ' '
    // ducks is just 'duck' when used as an adjective
    text = text.replace('ducks', 'duck')
  }
  postfix_keys = keys.slice(prefix_pos)
  if (postfix_keys.length) {
    text += 'cats are '

    let conjunctions = []
    for (let att in postfix_keys) {
      conjunctions.push(
        (cur_atts[postfix_keys[att]] ? '' : 'not ') + postfix_keys[att]
      )
    }
    console.log(conjunctions)
    text += conjunctions.join(' and are ')
  } else {
    text += 'cats are here'
  }
  text += '?'

  // substitution.
  if (Math.random() < 0.5) text = text.replace(/not.blue/, 'white')
  if (Math.random() < 0.5) text = text.replace(/not.red/, 'white')
  if (Math.random() < 0.5) text = text.replace(/not.yellow/, 'white')

  clue = text
  speak(text)

  // remove existing cats and add new ones for the current level.
  $('svg:gt(0)').remove()
  var num_cats = cats_for_level(cur_level)
  for (var i = 0; i < num_cats; i++) {
    $('svg')
      .eq(0)
      .clone()
      .appendTo('body')
      .each(function(svg) {
        const $t = $(this)
        $(this).removeClass('hidden')

        for (var att = 0; att < ATTS.length; att++) {
          if (cur_atts[ATTS[att]] === true) {
            chance = chance_for_level(cur_level)
          } else if (cur_atts[ATTS[att]] === false) {
            chance = 1 - chance_for_level(cur_level)
          } else {
            chance = 0.5
          }
          console.log(chance)
          if (Math.random() < chance) $t.addClass(ATTS[att])
        }
      })
  }

  if (get_answer().length > 9) {
    console.log('Too many cats, generate a new puzzle.')
    make_cats()
  }
}

const sound = function(s) {
  var snd = new Audio(s + '.mp3')
  snd.play()
}

$('body').keyup(function(e) {
  if (!/\d/.test(e.key)) return
  submit(parseInt(e.key))
})

const get_answer = function() {
  return $('svg:visible').filter(function(svg) {
    let match = true
    for (let att in cur_atts) {
      match =
        match &&
        (cur_atts[att] ? $(this).hasClass(att) : !$(this).hasClass(att))
    }
    return match
  })
}

const submit = function(value) {
  let answer = get_answer()
  answer.addClass('circle')
  console.log('answer:', answer.length)
  if (value === answer.length) {
    speak("That's right, " + answer.length, {
      onend: function() {
        make_cats()
      }
    })
  } else {
    speak("Good try, but that's wrong.", {
      onend: function() {
        speak(clue)
      }
    })
  }
}
