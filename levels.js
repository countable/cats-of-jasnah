

const Level = {
	num_cats: function(){
		return Math.floor(Math.random() * (this.max + 1 - this.min)) + this.min
	},
	get_value: function(key) {
		// fetch a value in the level using rich
		// specifiers, like a list of possible values
		let value = this[key]
		if (Array.isArray(value)) {
			value = value[Math.floor(Math.random()*value.length)]
		}
		return value
	},
	chance: function() {
		if (this.operator === 'or') return 0.6 - 0.1 * this.num_atts;
		else return 0.4 + 0.1 * this.num_atts;
	},
	min: 0,
	max: 9,
	operator: 'and',
	get_num_adjectives: function(keys) { // no semantic difference, just use adjectives in sentence structure.
		if (this.num_adjectives !== null) return this.num_adjectives
        return Math.floor(Math.random()*keys.length)
	},
	num_adjectives: null, // by default, it's random.
	
	max_asked_atts: 99, // no more than this many atts asked. normally don't set.
	
	num_atts: 3, // attributes to apply to cats
	att_chance: 1,
	set_avail_atts: function() {
		ATTS = [
		  pick_rand(COLOR_ATTS),
		  pick_rand(MOTION_ATTS),
		  pick_rand(ANIMAL_ATTS)
		].slice(0,this.num_atts)
		console.log(ATTS, this.num_atts)
	},
	negation: false,
	get_stars: function() {
	    return parseInt(localStorage[this.get_key()] || '0')
	},
	add_star: function() {
		localStorage[this.get_key()] = Math.min(this.get_stars() + 1, 5)
	},
	get_key: function() {
		return this.name.replace(/\s/g, '-')
	},
	lose_stars: function() {
		localStorage[this.get_key()] = 0
	}
}


const TOPICS = [
	{
		name: 'counting',
		stages: [
			{
				name: 'little cardinals',
				min: 1,
				max: 3,
				max_asked_atts: 0,
				num_atts: 0
			},
			{
				name: 'cardinals',
				min: 3,
				max: 5,
				max_asked_atts: 0,
				num_atts: 0
			},
			{
				name: 'big cardinals',
				min: 4,
				max_asked_atts: 0,
				num_atts: 0
			},
			{
				name: 'little distraction',
				min: 1,
				max: 5,
				max_asked_atts: 0,
				num_atts: 1
			},
			{
				name: 'distraction',
				min: 1,
				max: 7,
				max_asked_atts: 0,
				num_atts: 1
			},
			{
				name: 'big distraction',
				min: 1,
				max_asked_atts: 0,
				num_atts: 3
			},
			{
				name: 'with zero',
				max: 2,
				num_atts: 0,
				max_asked_atts: 0,
				num_atts: 3
			},
			{
				name: 'counting mastery',
				num_atts: 3,
				max_asked_atts: 0
			}
		]
	},
	{
		name: 'subsets',
		stages: [
			{
				name: 'little subset',
				min: 2,
				max: 3,
				max_asked_atts: 1,
				num_atts: 1,
				num_adjectives: 0
			},
			{
				name: 'subset',
				min: 4,
				max: 5,
				max_asked_atts: 1,
				num_atts: 1,
				num_adjectives: 0
			},
			{
				name: 'big subset',
				min: 4,
				max: 7,
				max_asked_atts: 1,
				num_atts: 1,
				num_adjectives: 0
			},
			{
				name: 'adjectives',
				min: 2,
				max: 7,
				max_asked_atts: 1,
				num_adjectives: 1,
				num_atts: 1  
			},
			{
				name: 'subset distraction',
				min: 3,
				max: 5,
				max_asked_atts: 2,
				num_atts: 2
			},
			{
				name: 'big subset distraction',
				min: 4,
				max_asked_atts: 2
			},
			{
				name: 'subset with zero',
				max: 2,
				max_asked_atts: 1,
				num_atts: 1
			},
			{
				name: 'subset mastery',
				max_asked_atts: 3
			}
		]
	},
	{
		name: 'operators',
		stages: [
			{
				name: 'little negation', // how many cats are not A
				negation: true,
				min: 2,
				max: 4,
				num_atts: 1
				// returns whether a given value is to be negated.
			},
			{
				name: 'big negation', // how many cats are not A
				negation: true,
				num_atts: 2
				// returns whether a given value is to be negated.
			},
			{
				name: 'intersection', // how many A cats are B
				max_asked_atts: 2,
				num_atts: 2,
				min: 2, max: 5,
				num_adjectives: 1
			},
			{
				name: 'conjunction', // how many A cats are B
				max_asked_atts: 2,
				num_atts: 2,
				min: 2, max: 5,
				num_adjectives: 0
			},
			{
				name: 'union',
				max_asked_atts: 2,
				num_atts: 2,
				min: 2, max: 5,
				num_adjectives: 1,
				operator: 'or'
			},
			{
				name: 'disjunction',
				max_asked_atts: 2,
				num_atts: 2,
				min: 2, max: 5,
				num_adjectives: 0,
				operator: 'or'
			},
			{
				name: 'triple intersection', // how many A cats are B and C
				max_asked_atts: 3,
				num_atts: 3,
				min: 4, max: 7,
				num_adjectives: 1
			},
			{
				name: 'operator mastery', // how many A cats are B and C
				max_asked_atts: 3,
				num_atts: 3,
				min: 2, max: 9,
				num_adjectives: 0,
				operator: 'or',
				negation: [false, false, true]
			}
		]
	}/*,
	{
		name: 'arithmetic group',
		stages: [
			'successor', // if we had another, how many cats would there be?
			'successor successor', // if we had two more, how many cats would there be?
			'addition', // if we had N more, how many cats would there be?
			'inverse successor', // if we had one fewer cat, how many there be?
			'subtraction', // if we had N fewer cats, how many would there be?
			'successor subset',
			'addition subset',
			'subtraction subset'
		]
	},
	{
		name: 'word problems',
		stages: [
			'supposition', // if all red cats were blue, how many red cats?
			'independence', // if all red cats were blue, how many spinning cats?
			'supremum', // what is the most cats that is less than the number of red cats?
			'infimum', // what is the least cats that is more than the number of red cats?
			'implication' // how many cats obey/break the rule 'red cats must be spinning'
		]
	}*/
]

h = ''
for (j=0;j<TOPICS.length;j++) { // make stages into inherited objects.
	topic = TOPICS[j]
	h += '<ul>'
	for (var i=0;i<topic.stages.length;i++) {
		topic.stages[i].__proto__ = Level
		topic.stages[i].number = i
		topic.topic_number = j
		topic.stages[i].topic = topic
		if (topic.stages[i].name)
			h += '<li onclick="set_level('+j+','+i+')">'
				+ topic.stages[i].name
				+ (topic.stages[i].get_stars() > 0 ? ' ' + topic.stages[i].get_stars() + '&starf;': '')
				+ '</li>'
	}
	h += '</ul>'
}
$('.topics').html(h)