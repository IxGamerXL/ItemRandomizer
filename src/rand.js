// Elements
const finput = document.getElementById('fileinput');
const out = document.getElementById('output');
const mninput = document.getElementById('maxnames');
const msinput = document.getElementById('maxstats');

// Long-standing variables
var nameSegments = () => mninput.value;
var statSegments = () => msinput.value;
var randFiles;
var variables;

function parseRands(){
	let prefixes = [];
	let names = [];
	let stats = [];
	let vars = [];
	
	try{
		
		randFiles.forEach(v => {
			
			let groupex = /\n-\n/;
			let valex = /\n/g;
			
			let full = v.split(groupex);
			let tempp = full[0].split(valex);
			let tempn = full[1].split(valex);
			let temps = full[2].split(valex);
			let tempv = [];
			if(full[3] != undefined)
				tempv = full[3].split(valex);
			
			prefixes = prefixes.concat(tempp);
			names = names.concat(tempn);
			stats = stats.concat(temps);
			vars = vars.concat(tempv);
			
		});
		
	}catch(e){
		console.error(e);
		return Error("Could not parse random variables.")
	}
	
	[prefixes,names,stats,vars].forEach(clrEmp);
	
	let t = {prefixes:prefixes, names:names, stats:stats, vars:vars};
	console.log(t);
	return t;
}

function randomize(){
	console.clear();
	
	let t = parseRands();
	if(typeof t == Error){
		console.log(t);
		return
	}
	
	let randmsg = "";
	let got = 0;
	// Player definable temporary data
	variables = [];
	
	let repst = () => got < t.prefixes.length && got < nameSegments();
	while(repst()){
		let i = Math.floor(Math.random() * t.prefixes.length);
		console.log(i);
		randmsg += t.prefixes.splice(i,1)[0] + " ";
		got++;
	}
	
	let baseName = t.names[Math.floor(Math.random() * t.names.length)];
	randmsg += baseName+"\n\n";
	got = 0;
	
	repst = () => 0 < t.stats.length && got < statSegments();
	while(repst()){
		let i = Math.floor(Math.random() * t.stats.length);
		
		let m = t.stats.splice(i,1)[0].split(/\\/g);
		let me = m[0]
		me = me!=null ? me.split(/,/g) : [];
		let mex = m[1]
		mex = mex!=null ? mex.split(/,/g) : [];
		let mm = m[m.length-1];
		
		let mevalid = true;
		let compat = function(v){
			let yes = false;
			for(sti in v) if(v[sti]==baseName) yes=true;
			return yes;
		}
		
		console.log(me, mex, mm);
		
		// Check if the base item name is one of the WLed
		if(!(m[1]=="" || m[1]==null))
			if(me.length > 0) mevalid = compat(me);
		
		// Check if the base item name is one of the BLed
		if(!(m[2]=="" || m[2]==null))
			if(mex.length > 0) mevalid = !compat(mex);
		
		
		console.log(mevalid);
		
		if(mevalid){
			let prev;
			while(mm != prev){
				prev = mm;
				
				for(varid in t.vars) varHandler(t.vars[varid]);
				
				// Thanks JS for forcing me into using this
				for(vi in variables){
					mm = mm.replace("#"+vi, variables[vi]);
				};
				
				mm = replaceTags(mm);
			}
			
			randmsg += mm + (repst() ? "\n" : "");
			console.log(i+": Accepted\n\n"+mm+"\n");
			got++;
		}else console.log(i+": Rejected");
	}
	
	out.value = randmsg;
	console.log(randmsg);
}

// Replace predefined tags and add outcomes
function replaceTags(str){
	return str
		.replace(/@rand100r5/, randr(100,5))
		.replace(/@rand50r5/, randr(50,5))
		.replace(/@rand100/, rand(100))
		.replace(/@rand50/, rand(50))
		.replace(/@randbool/, rand(1) ? true : false)
		.replace(/@pn/, rand(1) ? "+" : "-");
}

// Simplistic operations packed into methods
const randr = (i,r) => Math.round(Math.random() * (i/r)) * r;
const randd = (i,d) => Math.round(Math.random() * (i*d)) / d;
const rand = (i) => Math.round(Math.random() * i);

// Very cool function to create new variables
// during runtime.
function varHandler(vs){
	let inst = vs.split(/ /g);
	let comb = "";
	switch(inst[0]){
		// Custom params for random numbers
		// Reference using #<variable name>
		case "rand":
			variables[inst[1]] = inst[3]!=null ?
				randr(inst[2],inst[3]):
				rand(inst[2]);
			break;
		
		// Same premise as rand, but it picks one of the
		// given params after variable name param
		case "randc":
			// Dependency: comb
			for(let id=2; id<inst.length; id++)
				comb += inst[id]+(id>=inst.length-1 ? "" : " ");
			comb = comb.split(/,/g);
			let pick = Math.floor(Math.random() * comb.length);
			variables[inst[1]] = comb[pick];
			break;
		
		// Simply sets the variable with value. Good
		// for making your initial .rand files smaller
		// Also uses unique values each ref if it contains
		// a variable reference or a default reference
		case "macro":
			// Dependency: comb
			for(let id=2; id<inst.length; id++)
				comb += inst[id]+(id>=inst.length-1 ? "" : " ");
			variables[inst[1]] = comb;
			break;
	}
}

// Clears up gaps in array
function clrEmp(array){
	array.forEach((v,i) => {
		if(v=="") array.splice(i,1);
	});
	return array;
}

// This damned function has to exist cause otherwise
// I have to deal with Promise's BS (still have to)
var ev;
function filePromiseEval(event){
	randFiles = [];
	ev = event;
	let files = event.target.files;
	for(let i=0; i<files.length; i++)
		files.item(i).text().then(txt => {
			let locali = i;
			randFiles[randFiles.length] = txt;
			console.log("Files promised: "+locali);
		});
}

finput.addEventListener('change', filePromiseEval);