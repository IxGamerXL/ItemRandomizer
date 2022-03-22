// Elements
const finput = document.getElementById('fileinput');
const out = document.getElementById('output');
const mninput = document.getElementById('maxnames');
const msinput = document.getElementById('maxstats');

// Long-standing variables
var nameSegments = () => mninput.value;
var statSegments = () => msinput.value;
var randFiles;

function parseRands(){
	let prefixes = [];
	let names = [];
	let stats = [];
	
	try{
		
		randFiles.forEach(v => {
			
			let groupex = /\n-\n/;
			let valex = /\n/g;
			
			let full = v.split(groupex);
			let tempp = full[0].split(valex);
			let tempn = full[1].split(valex);
			let temps = full[2].split(valex);
			
			prefixes = prefixes.concat(tempp);
			names = names.concat(tempn);
			stats = stats.concat(temps);
			
		});
		
	}catch(e){
		console.error(e);
		return Error("Could not parse random variables.")
	}
	
	let t = {prefixes:prefixes, names:names, stats:stats};
	console.log(t);
	return t;
}

function randomize(){
	let t = parseRands();
	if(typeof t == Error){
		console.log(t);
		return
	}
	
	let randmsg = "";
	let got = 0;
	
	let repst = () => got < t.prefixes.length && got < nameSegments();
	while(repst()){
		let i = Math.floor(Math.random() * t.prefixes.length);
		console.log(i);
		randmsg += t.prefixes.splice(i,1)[0] + " ";
		got++;
	}
	
	randmsg += t.names[Math.floor(Math.random() * t.names.length)] + "\n\n";
	got = 0;
	
	repst = () => got < t.stats.length && got < statSegments();
	while(repst()){
		let i = Math.floor(Math.random() * t.stats.length);
		console.log(i);
		
		let m = t.stats.splice(i,1)[0];
		
		let randr = (i,r) => Math.round(Math.random() * (i/r)) * r;
		let randd = (i,d) => Math.round(Math.random() * (i*d)) / d;
		let rand = (i) => Math.round(Math.random() * i);
		
		let prev;
		while(m != prev){
			m = m
				.replace(/@rand100r5/, randr(100,5))
				.replace(/@rand50r5/, randr(50,5))
				.replace(/@rand100/, rand(100))
				.replace(/@rand50/, rand(50))
				.replace(/@randbool/, rand(1) ? true : false);
			
			prev = m;
		}
		
		randmsg += m + (repst() ? "\n" : "");
		got++;
	}
	
	out.value = randmsg;
	console.log(randmsg);
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