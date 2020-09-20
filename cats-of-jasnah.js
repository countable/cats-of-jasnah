const COLOR_ATTS = ['red', 'blue', 'yellow', 'purple']
const MOTION_ATTS = ['bouncing', 'spinning']
const ANIMAL_ATTS = ['ducks']
const ALL_ATTS = COLOR_ATTS.concat(MOTION_ATTS).concat(ANIMAL_ATTS)
let ATTS
let cur_atts = {}
let clue
let stage

const pick_rand = function(seq) {
  return seq[Math.floor(Math.random() * seq.length)]
}
const set_level = function(topic_num, stage_num) {
  // initialization
  $('#logo').hide()
  $('.instructions').hide()
  $('#forkongithub').hide()
  $('.number-bar').show()
  $('.level-display').show()

  console.log(topic_num, stage_num)
  if (stage_num >= TOPICS[topic_num].stages.length) {

	  topic_num ++
	  if (topic_num >= TOPICS.length) {
		  return alert('this is the highest level already.')
	  }
	  stage_num = 0
  }
  stage = {}
  stage.__proto__ = TOPICS[topic_num].stages[stage_num]

  $('.level-number').text(
	topic_num + '-' + stage_num + ' | ' + stage.name
  )
  
  make_cats()
}

const permute_atts = function() {
  cur_atts = {}
  for (let i = 0; i < ATTS.length && i < stage.max_asked_atts; i++) {
    if (Math.random() < stage.att_chance) {
      cur_atts[ATTS[i]] = !stage.get_value('negation')
    }
  }
}


const speak = function(text, opts) {
  opts = opts || {}
  $('p.clue').html(text + "&#x1f508;")
  responsiveVoice.speak(text, 'US English Female', opts)
}

const draw_stars = function() {
  $('.stars').html(stage.get_stars() + '&starf;')
}

var make_cats = function() {
  stage.init()
  draw_stars()
  stage.set_avail_atts()
  permute_atts()
  is_reversed = Math.random() < 0.5
  let text = 'how many '
  const keys = Object.keys(cur_atts)
  const prefix_pos = stage.get_num_adjectives(keys)
  const prefix_keys = keys.slice(0, prefix_pos)
  if (prefix_keys.length) {
    let prefix_words = []
    for (let att in prefix_keys) {
      prefix_words.push(
        (cur_atts[prefix_keys[att]] ? '' : 'non-') + prefix_keys[att]
      )
    }
    text += prefix_words.join(', ') + ' '
    // ducks is just 'duck' when used as an adjective
    text = text.replace('ducks', 'duck')
  }
  postfix_keys = keys.slice(prefix_pos)
  if (postfix_keys.length) {
    text += 'cats ' + stage.get_equality_operator() + ' '

    let items = []
    for (let att in postfix_keys) {
      items.push(
        (cur_atts[postfix_keys[att]] ? '' : 'not ') + postfix_keys[att]
      )
    }
    text += items.join(' ' + stage.operator + ' are ')
  } else {
    text += 'cats ' + stage.get_equality_operator() + ' here'
  }
  if (stage.successor) {
	  // alternate wording
	  if (Math.random() > .5) {
		  text += ' if we had ' + Math.abs(stage.successor) + ' '
			+ (stage.successor > 0 ? 'more' : 'less')
	  } else {
		  text += ' if ' + Math.abs(stage.successor) + ' '
			+ (stage.successor > 0 ? 'more came' : 'went away')
	  }
  }
 
  text += '?'

  // substitution.
  if (stage.get_value('substitution')) {1
	if (Math.random() < 0.5) {
	  text = text.replace(/not.blue/, 'white')
	  text = text.replace(/not.red/, 'white')
	  text = text.replace(/not.yellow/, 'white')
	}
  }

  clue = text

  // remove existing cats and add new ones for the current level.
  $('svg:gt(0)').remove()
  num_cats = stage.num_cats()
  for (var i = 0; i < num_cats + stage.get_added_num(); i++) {
    $('svg')
      .eq(0)
      .clone()
      .appendTo('body')
      .each(function(svg) {
        const $t = $(this)
        $(this).removeClass('hidden')
		if (i >= num_cats) {
			$(this).addClass('hidden')
		}
        for (var att = 0; att < ATTS.length; att++) {
          if (cur_atts[ATTS[att]] === true) {
            chance = stage.chance()
          } else if (cur_atts[ATTS[att]] === false) {
            chance = 1 - stage.chance()
          } else {
            chance = 0.5
          }
          if (Math.random() < chance) $t.addClass(ATTS[att])
        }
      })
  }
  console.log('num_cats rendered', num_cats + stage.get_added_num(), $('svg:gt(0)').length)

  if (get_answer().length > 9) {
    console.log('Too many cats, generate a new puzzle.')
    return make_cats()
  } else if (get_answer().length == 0 &! stage.min > 0) {
    console.log('not enough cats.')
    return make_cats()
  }
  
  speak(clue)
}

const next_level = function(){
	let next_stage_num = stage.number + 1
	set_level(stage.topic.topic_number, next_stage_num)
}
const sound = function(s) {
  var snd = new Audio(s + '.mp3')
  snd.play()
}

$('body').keyup(function(e) {
  if (e.key === ' ') return next_level()
  if (!/\d/.test(e.key)) return
  submit(parseInt(e.key))
})

const get_answer = function() {
  let set = $('svg:gt(0)').filter(function(svg) {
    let match = stage.operator === 'and';
    for (let att in cur_atts) {
	  // consider negation
	  let in_set = (cur_atts[att] ? $(this).hasClass(att) : !$(this).hasClass(att));	
	  // conjunction / disjunction
      match =
        stage.operator === 'and' ? (match && in_set) : (match || in_set)
      
    }
    return match
  })
  set = set.slice(0, $('svg:visible').length + stage.get_added_num())
  console.log(set.length, 'answer size counted', set)
  return set
}

const submit = function(value) {
  let answer_set = get_answer()
  answer = answer_set.length
  console.log("COMPARING", value, 'to answer', answer)
  answer_set.addClass('circle')
  answer_set.filter('.hidden').addClass('ghost').removeClass('hidden')
  
  if (value === answer) {
	stage.add_star()
	//yay()
	let congrats = "That's right, " + answer + '.'
	if (stage.get_stars() == 5) {
	  congrats += " You're on a Winning Streak!"
	}
    speak(congrats, {
      onend: function() {
		/*if (stage.get_stars() == 5) {
		  next_level()
		} else {*/
		  make_cats()
		//}
      }
    })
  } else {
    speak("Good try, but that's wrong.", {
      onend: function() {
		stage.lose_stars()
		draw_stars()
        speak(clue)
      }
    })
  }
}

const n_str = function(n, s) {
	if (n < 2) return s
	return s + n_str(n-1, s)
}

const yay = function() {
	$(".splash").html(n_str(stage.get_stars(), '&starf;')).show().addClass('yay')
	setTimeout(function(){
		$('.splash').hide().removeClass('yay')
	}, 2000);
}
