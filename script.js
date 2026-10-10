var slideIndex = 1; 
var bDraw=false;   
var bDown=false; 
var bStart=false;
var gStart=false;
var qtext="";
var hit=0;
var miss=0;
var hammer = new Audio('./sub/Hammer.wav');
var pong = new Audio('./sub/Pong.wav');
var bmiss=true;
var bhit=false;
var oldkey="";
var rate=0;
const isMobile = () => ('ontouchstart' in document.documentElement);

if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
 {
	window.location.href = "phone.html";
     
    } 
const up_imageUrls = [
  './sub/up_gif/Frame0.png',
  './sub/up_gif/Frame1.png',
  './sub/up_gif/Frame2.png',
  './sub/up_gif/Frame3.png',
  './sub/up_gif/Frame4.png',
  './sub/up_gif/Frame5.png',
  './sub/up_gif/Frame6.png',
  './sub/up_gif/Frame7.png',
  './sub/up_gif/Frame8.png',
  './sub/up_gif/Frame9.png'];
const dn_imageUrls = [
  './sub/down_gif/Frame0.png',
  './sub/down_gif/Frame1.png',
  './sub/down_gif/Frame2.png',
  './sub/down_gif/Frame3.png',
  './sub/down_gif/Frame4.png',
  './sub/down_gif/Frame5.png',
  './sub/down_gif/Frame6.png',
  './sub/down_gif/Frame7.png',
  './sub/down_gif/Frame8.png',
  './sub/down_gif/Frame9.png',
  './sub/down_gif/Frame10.png',
  './sub/down_gif/Frame11.png',
  './sub/down_gif/Frame12.png',
   './sub/down_gif/Frame13.png'
];
const hit_imageUrls = [
//'./sub/hit_gif/Frame0.png',
  './sub/hit_gif/Frame1.png',
//  './sub/hit_gif/Frame2.png',
  './sub/hit_gif/Frame3.png',
//  './sub/hit_gif/Frame4.png',
  './sub/hit_gif/Frame5.png',
//  './sub/hit_gif/Frame6.png',
  './sub/hit_gif/Frame7.png',
//  './sub/hit_gif/Frame8.png',
  './sub/hit_gif/Frame9.png',
//  './sub/hit_gif/Frame10.png',
  './sub/hit_gif/Frame11.png',
//  './sub/hit_gif/Frame12.png',
  './sub/hit_gif/Frame13.png'
  
  
];
const nohit_imageUrls = [
  //'./sub/nohit_gif/Frame0.png',
  './sub/nohit_gif/Frame1.png',
  //'./sub/nohit_gif/Frame2.png',
  './sub/nohit_gif/Frame3.png',
  //'./sub/nohit_gif/Frame4.png',
  './sub/nohit_gif/Frame5.png',
  //'./sub/nohit_gif/Frame6.png',
  './sub/nohit_gif/Frame7.png',
  //'./sub/nohit_gif/Frame8.png',
  './sub/nohit_gif/Frame9.png'
  // Add more image URLs as needed
];
// Create an array to store the loaded image objects
const up_images = [];
const dn_images = [];
const hit_images = [];
const nohit_images = [];
let loadedImages=0;
// Function to load the images
function loadImage(mode,url, index) {
  const image = new Image();
  image.src = url;
  
  image.onload = function() {
    // Increment the count of loaded images
    //loadedImages++;
    
    // Add the loaded image object to the images array
    if(mode==0) up_images[index] = image;
    if(mode==1) dn_images[index] = image;
    if(mode==2) hit_images[index] = image;
    if(mode==3) nohit_images[index] = image;
    
    
  };
}

// Function to draw the images on the canvas
function drawgif( mode, i, x, y) {
  
  // Iterate through the images array and draw each image
  
   image=new Image();
    if(mode==0)
	{
		image= up_images[i];
		
	}
	else if(mode==1)
	{
		image= dn_images[i];
	}
	else if(mode==2)
	{
		image= hit_images[i];
	}
	else if(mode==3)
	{
		image= nohit_images[i];
	}
	ctx.drawImage(image, x, y,80,80);
  }


// Load the images
for (let i = 0; i < up_imageUrls.length; i++) {
  loadImage(0,up_imageUrls[i], i);
}
for (let i = 0; i < dn_imageUrls.length; i++) {
  loadImage(1,dn_imageUrls[i], i);
}
for (let i = 0; i < hit_imageUrls.length; i++) {
  loadImage(2,hit_imageUrls[i], i);
}
for (let i = 0; i < nohit_imageUrls.length; i++) {
  loadImage(3,nohit_imageUrls[i], i);
}
function goton(n)
	{
		slideIndex=n;
	  showDivs(slideIndex);
	}
function next()
	{
		slideIndex++;
	  showDivs(slideIndex);
	}
function nextcha1() {
	  bShowKey=true;
	  slideIndex=26;
	  showDivs(26);
	};
function nextcha2() {
 bShowKey=false;
 slideIndex=26;
  showDivs(26);
};
function pickRandomNumbers(totalNumbers, count) {
  const numbers = Array.from({ length: totalNumbers }, (_, i) => i + 1);
  const selectedNumbers = [];

  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * numbers.length);
    const selectedNumber = numbers.splice(randomIndex, 1)[0];
    selectedNumbers.push(selectedNumber);
  }

  return selectedNumbers;
}

const totalNumbers = 200;
const cnt = 60;
var sNumbers = pickRandomNumbers(totalNumbers, cnt);
var gNumbers = pickRandomNumbers(160, 10);
var canvas = document.getElementById("myCanvas");
var gkey="";
//var context = canvas.getContext("2d");
//var cnvsBuffer = document.createElement('canvas');
var ctx = canvas.getContext('2d');
var cDate=""; 
var heightRatio = 0.43;
ctx.canvas.width = 900;
	ctx.canvas.height =500;	
	
	var mAry13=["က","င","စ","ည","တ","န","ပ","မ","ယ","သ","အ","က","စ","တ","ပ","ယ","င","ည","န","မ","သ","အ","ခ","ဂ","ဃ","ထ","ဒ","ဓ","ရ","လ","ဝ","ဖ","ဗ","ဘ","ဆ","ဇ","ဈ","အ","ဟ","ဠ"];
	var eAry13=["d","e","x","z","s","w","c","v","f","r","a","d","x","s","c","f","e","z","w","v","r","a","du","do","duo","su","so","suo","fu","fo","fuo","cu","co","cuo","xu","xo","xuo","a","au","ao"];
	var fAry13=["က","င","စ","ည","တ","န","ပ","မ","ယ","သ","အ","က","စ","တ","ပ","ယ","င","ည","န","မ","သ","အ","က ခ","က ဂ","က ခ ဃ","တ ထ","တ ဒ","တ ထ ဓ","ယ ရ","ယ လ","ယ ရ ဝ","ပ ဖ","ပ ဗ","ပ ဖ ဘ","စ ဆ","စ ဇ","စ ဆ ဈ","အ","အ ဟ","အ ဠ"];
	
	
	var mAry16=["ခ","ဂ","ဃ","ထ","ဒ","ဓ","ရ","လ","ဝ","ဖ","ဗ","ဘ","ဆ","ဇ","ဈ","အ","ဟ","ဠ"];
	var eAry16=["du","do","doo","su","so","soo","fu","fo","foo","cu","co","coo","xu","xo","xoo","a","au","ao"];
	var fAry16=["က ခ","က ဂ","က ဂ ဃ","တ ထ","တ ဒ","တ ဒ ဓ","ယ ရ","ယ လ","ယ လ ဝ","ပ ဖ","ပ ဗ","ပ ဗ ဘ","စ ဆ","စ ဇ","စ ဇ ဈ","အ","အ ဟ","အ ဠ"];
	
	var mAry17=["်","ဲ","ွ","ျ","း","့"];
	var eAry17=["k","kk","m","mm",";",";;"];
	var fAry17=["်","် ဲ","ွ","ွ ျ","း","း ့"];

	var mAry18=["ိ","ီ","ံ","ု","ှ","ူ","‌ေ","‌ြ","ာ","ါ"];
	var eAry18=["i","ii","iii",",",",,",",,,","j","jj","l","ll"];
	var fAry18=["ိ","ိ ီ","ိ ီ ံ","ု","ု ှ","ု ှ ူ","‌ေ","‌ေ ‌ြ","ာ","ာ ါ"];
	
	var mAry21=["ယ်","ဒီ","စာ","၍","‌အု","‌မီး","မေ","‌ပေါ်","ဒါ","အဲ","ထိ","နို","စွာ","လာ","‌ကျွ","‌လော","သူက","ပြင်","တ္တူ","ဒါဟာ","ထား","ဇွန်","အပူ","‌ရော","မေမေ","ကလေး"];
	var eAry21=["fk","soii","xl","pg","a,","vii;","jv","jcllk","soll","akk","sui","wi,","xml","fol","dmmm","jfol","r,,,d","cjjek","sps,,,","sollaul","sul;","xomwk","ac,,,","jful","jvjv","djfo;"];
	var fAry21=["ယ ယ်","တ ဒ ဒိ ဒီ","စ စာ","၍","အ အု","မ မိ မီ မီး","ေ မေ","ေ ပေ ပော ပေါ ပေါ်","တ ဒ ဒာ ဒါ","အ အ် အဲ","တ ထ ထိ","န နိ နို","စ စွ စွာ","ယ လ လာ","က ကွ ကျ ကျွ","ေ ‌ယေ လေ လော","သ သု သှ သူ သူက","ပ ပ‌ေ ပြ ပြင ပြင်","တ တ္တ တ္တု တ္တှ တ္တူ","တ ဒ ဒာ ဒါ ဒါအ ဒါဟ ဒါဟာ","တ ထ ထာ ထား","စ ဇ ဇွ ဇွန ဇွန်","အ အပ အပု အပှ အပူ","ေ ယေ ရေ ရော","ေ မေ မေ‌ေ မေမေ","က က‌ေ ကယေ ကလေ ကလေး"];

	var mAry23=["ယ်","ဒီ","စာ","၍","‌အု","‌မီး","မေ","‌ပေါ်","ဒါ","အဲ","ထိ","နို","စွာ","လာ","‌ကျွ","‌လော","သူက","ပြင်","တ္တူ","ဒါဟာ","ထား","ဇွန်","အပူ","‌ရော","မေမေ","ကလေး","ကား","အရ","ကြီး","သတိ","ဖျက်","ရက်","နာရီ","မသိ","ယခု","ဆရာ","စာသ","ဧက","ဘာမှ","ဘေး","ရေခံ","ခု၏","ဒီမှာ","မူးယစ်","ဗုဒ္ဓ","စကား","ဘုရား"];
	var eAry23=["fk","soii","xl","pg","a,","vii;","jv","jcllk","soll","akk","sui","wi,","xml","fol","dmmm","jfol","r,,,d","cjjek","sps,,,","sollaul","sul;","xomwk","ac,,,","jful","jvjv","djfo;","dl;","afu","pkii;","rsi","cummdk","fudk","wlfuii","vri","fdu,","xuful","xlr","pjd","cuolv,,","jcuo;","jfuduiii","du,pn","soiiv,,l","v,,,;fxk","co,sopsuo","xdl;","cuo,ful;"];
	var fAry23=["ယ ယ်","တ ဒ ဒိ ဒီ","စ စာ","၍","အ အု","မ မိ မီ မီး","ေ မေ","ေ ပေ ပော ပေါ ပေါ်","တ ဒ ဒာ ဒါ","အ အ် အဲ","တ ထ ထိ","န နိ နို","စ စွ စွာ","ယ လ လာ","က ကွ ကျ ကျွ","ေ ‌ယေ လေ လော","သ သု သှ သူ သူက","ပ ပ‌ေ ပြ ပြင ပြင်","တ တ္တ တ္တု တ္တှ တ္တူ","တ ဒ ဒာ ဒါ ဒါအ ဒါဟ ဒါဟာ","တ ထ ထာ ထား","စ ဇ ဇွ ဇွန ဇွန်","အ အပ အပု အပှ အပူ","ေ ယေ ရေ ရော","ေ မေ မေ‌ေ မေမေ","က က‌ေ ကယေ ကလေ ကလေး","က ကာ ကား","အ အယ အရ","ဩ ဩိ ဩီ ဩီး","သ သတ သတိ","ပ ဖ ဖွ ဖျ ဖျက ဖျက်","ယ ရ ရက ရက်","န နာ နာယ နာရ နာရိ နာရီ","မ မသ မသိ","ယ ယက ယခ ယခု","စ ဆ ဆယ ဆရ ဆရာ","စ စာ စာသ","ဧ ဧက","ပ ဖ ဘ ဘာ ဘာမ ဘာမု ဘာမှ","ေ ပေ ဖေ ဘေ ဘေး","ေ ယေ ရေ ရေက ရေခ ရေခိ ရေခီ ရေခံ","က ခ ခု ခု၏","တ ဒ ဒိ ဒီ ဒီမ ဒီမု ဒီမှ ဒီမှာ","မ မု မှ မူ မူး မူးယ မူးယစ မူးယစ်","ပ ဗ ဗု ဗုတ ဗုဒ ဗုဒ္တ ဗုဒ္ထ ဗုဒ္ဓ","စ စက စကာ စကား","ပ ဖ ဘ ဘု ဘုယ ဘုရ ဘုရာ ဘုရား"];

	var gAry=["w","e","r","s","d","f","x","c","v","u","i","o","j","k","l","m",",",".","w","e","r","s","d","f","x","c","v","u","i","o","j","k","l","m",",",".","w","e","r","s","d","f","x","c","v","u","i","o","j","k","l","m",",",".","w","e","r","s","d","f","x","c","v","u","i","o","j","k","l","m",",",".","w","e","r","s","d","f","x","c","v","u","i","o","j","k","l","m",",",".","w","e","r","s","d","f","x","c","v","u","i","o","j","k","l","m",",",".","w","e","r","s","d","f","x","c","v","u","i","o","j","k","l","m",",",".","w","e","r","s","d","f","x","c","v","u","i","o","j","k","l","m",",",".","w","e","r","s","d","f","x","c","v","u","i","o","j","k","l","m",",",".","w","e","r","s","d","f","x","c","v","u","i","o","j","k","l","m",",","."];
	var gAry2=["q","q","q","q","q","q","q","q","q","q","q","q","q","q","q","q","q","q","q","q","q","q","w","w","w","w","w","w","w","w","w","w","e","e","e","e","e","e","e","e","e","e","r","r","r","r","r","r","r","r","r","r","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","a","s","s","s","s","s","s","s","s","s","s","d","d","d","d","d","d","d","d","d","d","f","f","f","f","f","f","f","f","f","f","z","z","z","z","z","z","z","z","z","z","z","z","z","z","z","z","z","z","z","z","z","z","x","x","x","x","x","x","x","x","x","x","c","c","c","c","c","c","c","c","c","c","v","v","v","v","v","v","v","v","v","v","u","u","u","u","u","u","u","u","u","u","i","i","i","i","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","p","j","j","j","j","j","j","j","j","j","j","k","k","k","k","k","k","k","k","k","k","l","l","l","l","l","l","l","l","l","l",";",";",";",";",";",";",";",";",";",";",";",";",";",";",";",";",";",";",";",";",";",";","m","m","m","m","m","m","m","m","m","m",",",",",",",",",",",",",",",",",",",",",".",".",".",".",".",".",".",".",".","."];
	var gAry3=["q","q","q","q","q","q","q","q","q","q","w","w","w","w","w","w","w","w","w","w","e","e","e","e","e","e","e","e","e","e","r","r","r","r","r","r","r","r","r","r","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","t","y","y","y","y","y","y","y","y","y","y","y","y","y","y","y","y","y","y","y","y","y","y","a","a","a","a","a","a","a","a","a","a","s","s","s","s","s","s","s","s","s","s","d","d","d","d","d","d","d","d","d","d","f","f","f","f","f","f","f","f","f","f","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","g","h","h","h","h","h","h","h","h","h","h","h","h","h","h","h","h","h","h","h","h","h","h","z","z","z","z","z","z","z","z","z","z","x","x","x","x","x","x","x","x","x","x","c","c","c","c","c","c","c","c","c","c","v","v","v","v","v","v","v","v","v","v","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","b","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","n","u","u","u","u","u","u","u","u","u","u","i","i","i","i","i","i","i","i","i","i","o","o","o","o","o","o","o","o","o","o","p","p","p","p","p","p","p","p","p","p","j","j","j","j","j","j","j","j","j","j","k","k","k","k","k","k","k","k","k","k","l","l","l","l","l","l","l","l","l","l",";",";",";",";",";",";",";",";",";",";","m","m","m","m","m","m","m","m","m","m",",",",",",",",",",",",",",",",",",",",",".",".",".",".",".",".",".",".",".","."];
	var curelem="";
	var keystep=0;
	var img = new Image (); //이미지 객체 생성
	var kimg = new Image ();
	var kimg2 = new Image ();
	var gimg = new Image ();
	var kimg = new Image ();
	var gimg2 = new Image ();
	var kimg3 = new Image ();
	var kimg4 = new Image ();
	var kimg5 = new Image ();
	var kimg5lev1 = new Image ();
	var kimg6lev2 = new Image ();
	var kimg7lev3 = new Image ();
	var	kimg5suc= new Image ();
	var kimg6 = new Image ();
	var mimg = new Image ();
	var mimg2 = new Image ();
	var gif = new Image ();
	var pimg = new Image ();
	pimg.src="./sub/20p_popup.png" ;
	gif.src = "./sub/nohit.gif" ; 
	var intext="|";
	var pkey="";
	var okey="";
	var inkey="";
	var finishkey="";
	var index=0;
	
	var step=0;
	var pos=1.0;
	var score = 0;
	var hratio=0;
	var bFinish=true;
	
	var curkey="";
	var prekey="";
	kimg5.src = "./sub/5p_gametitle.png" ;
	kimg5lev1.src= "./sub/5p_level1.png" ;
	kimg6lev2.src= "./sub/6p_level2.png" ;
	kimg7lev3.src= "./sub/7p_level3.png" ;
	kimg5suc.src = "./sub/7P_success.png" ;
	kimg3.src = "./sub/23p_main.png" ;
	kimg4.src = "./sub/24p.png" ;
	/*
	img.src = "./haikana_simg/m2.png" ; 
	kimg.src = "./sub/6p.png" ; 
	kimg2.src = "./sub/26p.png" ;
	
	
	kimg6.src = "./sub/game3p.png" ;
	mimg.src = "./sub/1more3.png" ;
	mimg2.src = "./sub/cert2.png" ;*/
	
	var btn = new Image (); 
	var predic= new Image ();
	var prepos=-1;
	
	var dy=0.3;
	var bl=false;
	var startTime = Date.now();
	var seconds=0;
	var stX =0;
	var stY =0;
	var mpos=-1;
	var dn=false;
	var on=false;
	var db;
	var id="";
	var rank="";
	var total="";
	var result="";
	var bShowKey=true;
	var bOn1=false;
	var bOn2=false;
	var menu_mode=0;
    var temp21="";
	function start() {
	  startTime = Date.now();
	};

	function end() {
		
		var review="";
		 var ele1 = document.getElementsByName('chk_info1');
 
            for (i = 0; i < ele1.length; i++) {
                if (ele1[i].checked)
                    review+= "1:"+ ele1[i].value+" ";
            }
			var ele2 = document.getElementsByName('chk_info2');
 
            for (i = 0; i < ele2.length; i++) {
                if (ele2[i].checked)
                    review+= "2:"+ ele2[i].value+" ";
            }
			var ele3 = document.getElementsByName('chk_info3');
 
            for (i = 0; i < ele3.length; i++) {
                if (ele3[i].checked)
                    review+= "3:"+ ele3[i].value+" ";
            }
			var ele4 = document.getElementsByName('chk_info4');
 
            for (i = 0; i < ele4.length; i++) {
                if (ele4[i].checked)
                    review+= "4:"+ ele4[i].value;
            }
	  
	  var email=document.getElementById('email').value;
	 // var review=document.getElementById('review').value;
	  //var rate=document.getElementById('rate').value;
	  /*var endTime = Date.now();
	  var timeDiff = endTime - startTime; //in ms
	  // strip the ms
	  timeDiff /= 1000.0;
		console.log("st:"+startTime+" "+"et:"+endTime);
	  // get seconds 
	  seconds = timeDiff.toFixed(2);//Math.round(timeDiff);*/
	  cDate=new Date().toLocaleDateString('ja-jp', { hour:"numeric",minute:"numeric", year:"numeric", month:"short", day:"numeric"}) ;
	  console.log(seconds + " seconds");
	 /////
		const xhr = new XMLHttpRequest();
		const url = "./dbutil.php";
		const params = "WDATE="+Date.now().toString()+"&rate="+rate+"&email="+email+"&review="+review; 
		//const params = "email=ss@kk&review=lllll&rate=3"
		xhr.open("POST", url, true);

		// Set headers if needed
		xhr.setRequestHeader("Content-type", "application/x-www-form-urlencoded");

		xhr.onreadystatechange = function () {
		  if (xhr.readyState == 4 && xhr.status == 200) {
			//console.log(xhr.responseText); // Response from PHP script
			result=xhr.responseText;
			console.log(result);
		  }
	};

			xhr.send(params);
			slideIndex=33;
			showDivs(slideIndex);
	 //////
	}
	
	
	
	canvas.addEventListener ( "mouseup" , function(me) {
	mUP(me)}, false );
	canvas.addEventListener ( "mousedown" , function(me) {
	mDown(me)}, false );
	canvas.addEventListener ( "mousemove" , function(me) {
	mOver(me)}, false );
	
	document.addEventListener("keydown", keyDownHandler, false);
	var videoContainer;
	var r=new Array();
	function back()
	{
		
				if(slideIndex==21)
				{
					slideIndex=19;
				}
				else if(slideIndex==8)
				{
					slideIndex=5;
				}
				else if(slideIndex==25)
				{
					slideIndex=12;
				}
				else if(slideIndex==13)
				{
					slideIndex=25;
				}
				else if(slideIndex==17)
				{
					slideIndex=13;
				}
				else
				{
					slideIndex--;
					if(slideIndex<1) slideIndex=1;
					
				}
				showDivs(slideIndex);
					bFinish=false;
		
	}
	function home()
	{
		slideIndex=1;
		showDivs(slideIndex);
		bFinish=false;
	}
	function down()
	{
		dn=true;
		draw();
		setTimeout(() => {   
			var link = document.createElement('a');
			link.download = 'cert_doremi.png';
			link.href = document.getElementById('myCanvas').toDataURL('image/png')
			link.click();
			
			}, 1000 );
		
		//dn=false;
		//draw();
		
	}
	function copy()
	{
		dn=true;
		draw();
		setTimeout(() => {   
			canvas.toBlob(function(blob) { 
			const item = new ClipboardItem({ "image/png": blob });
			navigator.clipboard.write([item]); 
			});
			alert("copyed to clipboard");
			}, 1000 );
		
		
		
		//dn=false;
		//draw();
	}
	function setpage(n)
	{
			if(n==-1) slideIndex=1;
			if(n==0) slideIndex=2;
			if(n==1) slideIndex=8;
			if(n==2) slideIndex=17;
			if(n==3) slideIndex=21;
			if(n==4) slideIndex=23;
			
			
			showDivs(slideIndex);
			bFinish=false;
	}
	function mUP(me)
	{
		stX = me.offsetX ; 
		stY = me.offsetY ; 
		
		
		if(slideIndex==27)
		{
			
			stX = me.offsetX ; 
			stY = me.offsetY ; 
			if(stX >= 120 && stX <= 120+300  && stY >= 200 && stY <= 200+235)
			{
				if(menu_mode==1) 
				{
					bShowKey=true;
					slideIndex=26;
					showDivs(26);
				}
				if(menu_mode==3) 
				{
					bShowKey=false;
					slideIndex=26;
					showDivs(26);
				}
				if(menu_mode==5) 
				{
					bShowKey=true;
					slideIndex=26;
					showDivs(26);
				}
					
				console.log("m:"+menu_mode);
			}
			if(stX >= 470 && stX <= 470+300  && stY >= 200 && stY <= 200+235)
			{
				
				if(menu_mode==2) 
				{
					bShowKey=false;
					slideIndex=26;
					showDivs(26);
				}
				if(menu_mode==4) 
				{
					//slideIndex=28;
					//showDivs(28);
				}
				if(menu_mode==6) 
				{
					bShowKey=false;
					slideIndex=26;
					showDivs(26);
				}
				console.log("m:"+menu_mode);
			}
		}
	}
	
	function mDown(me)
	{
		if(slideIndex==27)
		{
			stX = me.offsetX ; 
			stY = me.offsetY ; 
			if(stX >= 120 && stX <= 120+300  && stY >= 200 && stY <= 200+235)
			{
				console.log("b1");
				bOn1=true;
				bOn2=false;
			}
			else bOn1=false;
			if(stX >= 470 && stX <= 470+300  && stY >= 200 && stY <= 200+235)
			{
				console.log("b2");
				bOn1=false;
				bOn2=true;
			}
			else bOn2=false;
		}
			 
	}
		
	
	function mOver(me)
	{
		if(slideIndex==27)
		{
			stX = me.offsetX ; 
			stY = me.offsetY ; 
			if(stX >= 120 && stX <= 120+300  && stY >= 200 && stY <= 200+235)
			{
				document.getElementById("myCanvas").style.cursor = "pointer";
			}
			
			else if(stX >= 470 && stX <= 470+300  && stY >= 200 && stY <= 200+235)
			{
				document.getElementById("myCanvas").style.cursor = "pointer";
			}
			else document.getElementById("myCanvas").style.cursor = "default";
		}
	}
	function MyRect (x, y, w, h) {

		this.x = x;
		this.y = y;
		this.width = w;
		this.height = h;

		this.contains = function (x, y) {
			return this.x <= x && x <= this.x + this.width &&
				   this.y <= y && y <= this.y + this.height;
		}

		this.draw = function (ctx) {
			ctx.rect(this.x, this.y, this.width, this.height)
		}
	}
	function undateCanvas(){
    ctx.clearRect(10,70,canvas.width-10,canvas.height-70); // Though not always needed 
                                                     // you may get bad pixels from 
                                                     // previous videos so clear to be
                                                     // safe
    // only draw if loaded and ready
    if(videoContainer !== undefined && videoContainer.ready){ 
        // find the top left of the video on the canvas
        var scale = videoContainer.scale;
        var vidH = videoContainer.video.videoHeight-70;
        var vidW = videoContainer.video.videoWidth-20;
        var top = 70+(canvas.height-70) / 2 - (vidH /2 ) * scale;
        var left = 10+(canvas.width-20) / 2 - (vidW /2 ) * scale;
        // now just draw the video the correct size
        ctx.drawImage(videoContainer.video, left, top, vidW * scale, vidH * scale);
       
        }
		if(!bFinish)
		requestAnimationFrame(undateCanvas);
		else
		{
			fbtn.onload=function(){
						ctx.drawImage (fbtn,200,320,272,54);
						}
						ctx.drawImage (fbtn,200,320,272,54);
		}
	}
	function readyToPlayVideo(event){ // this is a referance to the video
    // the video may not match the canvas size so find a scale to fit
    videoContainer.scale = Math.min(
                         (canvas.width-20) / this.videoWidth, 
                         (canvas.height-70) / this.videoHeight); 
    videoContainer.ready = true;
    // the video can be played so hand it off to the display function
    requestAnimationFrame(undateCanvas);
	}

	function drawScore() {
	  ctx.font = "30px Arial";
	  ctx.fillStyle = "#fff";
	  ctx.fillText((step+1)+"/"+sNumbers.length, 60, 40);
	}
	function beep() { 
		var snd = new Audio("data:audio/wav;base64,//uQRAAAAWMSLwUIYAAsYkXgoQwAEaYLWfkWgAI0wWs/ItAAAGDgYtAgAyN+QWaAAihwMWm4G8QQRDiMcCBcH3Cc+CDv/7xA4Tvh9Rz/y8QADBwMWgQAZG/ILNAARQ4GLTcDeIIIhxGOBAuD7hOfBB3/94gcJ3w+o5/5eIAIAAAVwWgQAVQ2ORaIQwEMAJiDg95G4nQL7mQVWI6GwRcfsZAcsKkJvxgxEjzFUgfHoSQ9Qq7KNwqHwuB13MA4a1q/DmBrHgPcmjiGoh//EwC5nGPEmS4RcfkVKOhJf+WOgoxJclFz3kgn//dBA+ya1GhurNn8zb//9NNutNuhz31f////9vt///z+IdAEAAAK4LQIAKobHItEIYCGAExBwe8jcToF9zIKrEdDYIuP2MgOWFSE34wYiR5iqQPj0JIeoVdlG4VD4XA67mAcNa1fhzA1jwHuTRxDUQ//iYBczjHiTJcIuPyKlHQkv/LHQUYkuSi57yQT//uggfZNajQ3Vmz+Zt//+mm3Wm3Q576v////+32///5/EOgAAADVghQAAAAA//uQZAUAB1WI0PZugAAAAAoQwAAAEk3nRd2qAAAAACiDgAAAAAAABCqEEQRLCgwpBGMlJkIz8jKhGvj4k6jzRnqasNKIeoh5gI7BJaC1A1AoNBjJgbyApVS4IDlZgDU5WUAxEKDNmmALHzZp0Fkz1FMTmGFl1FMEyodIavcCAUHDWrKAIA4aa2oCgILEBupZgHvAhEBcZ6joQBxS76AgccrFlczBvKLC0QI2cBoCFvfTDAo7eoOQInqDPBtvrDEZBNYN5xwNwxQRfw8ZQ5wQVLvO8OYU+mHvFLlDh05Mdg7BT6YrRPpCBznMB2r//xKJjyyOh+cImr2/4doscwD6neZjuZR4AgAABYAAAABy1xcdQtxYBYYZdifkUDgzzXaXn98Z0oi9ILU5mBjFANmRwlVJ3/6jYDAmxaiDG3/6xjQQCCKkRb/6kg/wW+kSJ5//rLobkLSiKmqP/0ikJuDaSaSf/6JiLYLEYnW/+kXg1WRVJL/9EmQ1YZIsv/6Qzwy5qk7/+tEU0nkls3/zIUMPKNX/6yZLf+kFgAfgGyLFAUwY//uQZAUABcd5UiNPVXAAAApAAAAAE0VZQKw9ISAAACgAAAAAVQIygIElVrFkBS+Jhi+EAuu+lKAkYUEIsmEAEoMeDmCETMvfSHTGkF5RWH7kz/ESHWPAq/kcCRhqBtMdokPdM7vil7RG98A2sc7zO6ZvTdM7pmOUAZTnJW+NXxqmd41dqJ6mLTXxrPpnV8avaIf5SvL7pndPvPpndJR9Kuu8fePvuiuhorgWjp7Mf/PRjxcFCPDkW31srioCExivv9lcwKEaHsf/7ow2Fl1T/9RkXgEhYElAoCLFtMArxwivDJJ+bR1HTKJdlEoTELCIqgEwVGSQ+hIm0NbK8WXcTEI0UPoa2NbG4y2K00JEWbZavJXkYaqo9CRHS55FcZTjKEk3NKoCYUnSQ0rWxrZbFKbKIhOKPZe1cJKzZSaQrIyULHDZmV5K4xySsDRKWOruanGtjLJXFEmwaIbDLX0hIPBUQPVFVkQkDoUNfSoDgQGKPekoxeGzA4DUvnn4bxzcZrtJyipKfPNy5w+9lnXwgqsiyHNeSVpemw4bWb9psYeq//uQZBoABQt4yMVxYAIAAAkQoAAAHvYpL5m6AAgAACXDAAAAD59jblTirQe9upFsmZbpMudy7Lz1X1DYsxOOSWpfPqNX2WqktK0DMvuGwlbNj44TleLPQ+Gsfb+GOWOKJoIrWb3cIMeeON6lz2umTqMXV8Mj30yWPpjoSa9ujK8SyeJP5y5mOW1D6hvLepeveEAEDo0mgCRClOEgANv3B9a6fikgUSu/DmAMATrGx7nng5p5iimPNZsfQLYB2sDLIkzRKZOHGAaUyDcpFBSLG9MCQALgAIgQs2YunOszLSAyQYPVC2YdGGeHD2dTdJk1pAHGAWDjnkcLKFymS3RQZTInzySoBwMG0QueC3gMsCEYxUqlrcxK6k1LQQcsmyYeQPdC2YfuGPASCBkcVMQQqpVJshui1tkXQJQV0OXGAZMXSOEEBRirXbVRQW7ugq7IM7rPWSZyDlM3IuNEkxzCOJ0ny2ThNkyRai1b6ev//3dzNGzNb//4uAvHT5sURcZCFcuKLhOFs8mLAAEAt4UWAAIABAAAAAB4qbHo0tIjVkUU//uQZAwABfSFz3ZqQAAAAAngwAAAE1HjMp2qAAAAACZDgAAAD5UkTE1UgZEUExqYynN1qZvqIOREEFmBcJQkwdxiFtw0qEOkGYfRDifBui9MQg4QAHAqWtAWHoCxu1Yf4VfWLPIM2mHDFsbQEVGwyqQoQcwnfHeIkNt9YnkiaS1oizycqJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU=");

		snd.play(); 

	} 
	var str=[["はは","花束和","ハイカナ","初めて","ハローワーク"],["布武場","ふぉこ","ファイル","ファミリーマート","Facebook"],["部長","ブラウザ","ブロック","ブログ","ブロッコリー"],["ブラウザ","ブランド","ブラインドタッチ","ブラック","ブラジル",]];
	var tempkey="";
	var pre=false;
	var name="";
	var bNextenable=false;
	var pop=false;
	var qin=0;
	function keyDownHandler(e) {
		
		var skey=String.fromCharCode(e.keyCode);
		let inputkey = skey.toLowerCase();
		if(e.keyCode==188) inputkey=",";
		if(e.keyCode==190) inputkey=".";
		if(e.keyCode==191) inputkey="/";
		if(e.keyCode==186) inputkey=";";
		if(e.keyCode==222) inputkey="'";
		if(e.keyCode==219) inputkey="[";
		if(e.keyCode==221) inputkey="]";
		if(e.keyCode==220) inputkey="\\";
		
		
		if(slideIndex==19)
		{
			if(inputkey=="p")
			{

				intext="";
				slideIndex=20;
				showDivs(slideIndex);
				return;
			}
	
		}
			
		if(slideIndex==1)
		{
			if(inputkey =="1") setpage(0);
			if(inputkey =="2") setpage(1);
			if(inputkey =="3") setpage(2);
			if(inputkey =="4") setpage(3);
			if(inputkey =="5") setpage(4);

			return;
		}
		if(e.keyCode == 32)
		{
			
			
			if(slideIndex==24 ) return;
			if(bNextenable)
			{
				
				step=0;	
				prekey="";
				count=0;
				bStart=false;
				
				if(slideIndex==19)
				{
					slideIndex=21;
				}
				else if(slideIndex==5)
				{
					slideIndex=8;
				}
				else if(slideIndex==12)
				{
					slideIndex=25;
				}
				else if(slideIndex==25)
				{
					slideIndex=13;
				}
				else if(slideIndex==13)
				{
					slideIndex=17;
				}
				else
				slideIndex++;
			
				showDivs(slideIndex);
				
			}
			if(slideIndex==23 )
			{
				if(!bStart) 
				{
					
				
					bStart=true;
					var f = document.getElementsByClassName("bottomTxt");
						for (i = 0; i < f.length; i++) {
								
								f[i].style.cssText  ="align-items:center; visibility:hidden; justify-content: center; display: block; display: flex;flex-direction: row; align-items: right;width:100%;	height:auto;-ms-flex-align: center;   -webkit-align-items: center;";
						}
					
				}
				return;
			}
			
									
			
			return;
		}
		
		
		
		if(slideIndex==5 || slideIndex==6 || slideIndex==7)
		{
			
			hammer.play();
			curkey=inputkey;
			bmiss=false;
			
			
			//let inchar = gAry[gNumbers[step]-1] ;
			
			
		
			console.log(step+":"+prekey+":"+index+":"+":"+inputkey);
			
			
			if(inputkey==prekey)
			{
				
				bhit=true;
				console.log(step);
				if( step>=0)
				{	
			
					setTimeout(function () {
						
							step++;
							hit++;
							
							hfcnt=0;
							pfcnt=0;
							panicnt=0;
						
						if(step==gNumbers.length)
						{
							/*setTimeout(function () {
							
							bFinish=true;
							
							slideIndex++;
							showDivs(slideIndex);
							},2000);
							*/
						}
						else
						{
							
							
							console.log(prekey+":"+okey+":"+index+":"+":"+inputkey);
				
							pong.play();	
							if(slideIndex==5)
							prekey=gAry[gNumbers[step]-1] ;
							if(slideIndex==6)
							prekey=gAry2[gNumbers[step]-1] ;
							if(slideIndex==7)
							prekey=gAry3[gNumbers[step]-1] ;
							if(prekey==oldkey)
							{
								if(slideIndex==5)
								prekey=gAry[0];
								if(slideIndex==6)
								prekey=gAry2[0];
								if(slideIndex==7)
								prekey=gAry3[0];
							}
							oldkey=prekey;
						}
						
					}, 500);
				}
			}
			else
			{
				
				bmiss=true;
				console.log("miss");
				miss++;
				//beep();
				//step++;
				//prekey=gAry[gNumbers[step]-1] ;
			}
		
	}
		
		if(slideIndex==13)
		{
			
			curkey=inputkey;
			okey=eAry13[step];
			
			let inchar = okey.substr(index, 1);
			console.log(okey+":"+index+":"+inchar+":"+inputkey);
			if(inchar=="" || index>=okey.length) 
			{
				step++;
						
				index=0;
				intext="|";
				finishkey="";
				inkey="";
				keystep=0;
				return;
			}
			
			if(inputkey==inchar)
			{
				inkey +=inchar;
				 var jbSplit = fAry13[step].split(' ');
				 intext=jbSplit[index];
				
				
				
				if(intext==mAry13[step] || index >=okey.length-1)
				{
						step++;
						
						index=0;
						
						inkey="";
						keystep=0;
						
						
					
				}
				else
				{
						index++;
				}
				
				
				if(index==0 && step>0)
				{
					setTimeout(function () {
						
							
							intext="|";
							inkey="";
							finishkey="";
							keystep=0;
						if(step==mAry13.length)
						{
							bFinish=true;
							step=0;
							bNextenable=true;
							var f = document.getElementsByClassName("bottomTxt");
								for (i = 0; i < f.length; i++) {
										
										f[i].style.cssText  ="align-items:center; visibility:block; justify-content: center; display: block; display: flex;flex-direction: row; align-items: right;width:100%;	height:auto;-ms-flex-align: center;   -webkit-align-items: center;";
								}
							
							
						}
						else
						{
							qtext=mAry13[step];
							okey=eAry13[step];
							
							pkey=mAry13[step];
						}
						
					}, 500);
				}
			}
			else
			{
				beep();
			}
		
	}
	if(slideIndex==16)
		{
			
			curkey=inputkey;
			okey=eAry16[step];
			
			let inchar = okey.substr(index, 1);
			console.log(okey+":"+index+":"+inchar+":"+inputkey);
			if(inchar=="" || index>=okey.length) 
			{
				step++;
						
				index=0;
				intext="|";
				finishkey="";
				inkey="";
				keystep=0;
				return;
			}
			
			if(inputkey==inchar)
			{
				inkey +=inchar;
				 var jbSplit = fAry16[step].split(' ');
				 intext=jbSplit[index];
				
				
				
				if(intext==mAry16[step] || index >=okey.length-1)
				{
						step++;
						
						index=0;
						
						inkey="";
						keystep=0;
						
						
					
				}
				else
				{
						index++;
				}
				
				
				if(index==0 && step>0)
				{
					setTimeout(function () {
						
							
							intext="|";
							inkey="";
							finishkey="";
							keystep=0;
						if(step==mAry16.length)
						{
							bFinish=true;
							step=0;
							bNextenable=true;
							var f = document.getElementsByClassName("bottomTxt");
								for (i = 0; i < f.length; i++) {
										
										f[i].style.cssText  ="align-items:center; visibility:block; justify-content: center; display: block; display: flex;flex-direction: row; align-items: right;width:100%;	height:auto;-ms-flex-align: center;   -webkit-align-items: center;";
								}
							
							
						}
						else
						{
							qtext=mAry16[step];
							okey=eAry16[step];
							
							pkey=mAry16[step];
						}
						
					}, 500);
				}
			}
			else
			{
				beep();
			}
		
	}
	if(slideIndex==18)
		{
			
			curkey=inputkey;
			okey=eAry17[step];
			
			let inchar = okey.substr(index, 1);
			console.log(okey+":"+index+":"+inchar+":"+inputkey);
			if(inchar=="" || index>=okey.length) 
			{
				step++;
						
				index=0;
				intext="|";
				finishkey="";
				inkey="";
				keystep=0;
				return;
			}
			
			if(inputkey==inchar)
			{
				inkey +=inchar;
				 var jbSplit = fAry17[step].split(' ');
				 intext=jbSplit[index];
				
				
				
				if(intext==mAry17[step] || index >=okey.length-1)
				{
						step++;
						
						index=0;
						
						inkey="";
						keystep=0;
						
						
					
				}
				else
				{
						index++;
				}
				
				
				if(index==0 && step>0)
				{
					setTimeout(function () {
						
							
							
							intext="|";
							inkey="";
							finishkey="";
							keystep=0;
						if(step==mAry17.length)
						{
							bFinish=true;
							step=0;
							bNextenable=true;
							var f = document.getElementsByClassName("bottomTxt");
								for (i = 0; i < f.length; i++) {
										
										f[i].style.cssText  ="align-items:center; visibility:block; justify-content: center; display: block; display: flex;flex-direction: row; align-items: right;width:100%;	height:auto;-ms-flex-align: center;   -webkit-align-items: center;";
								}
							
							
						}
						else
						{
							qtext=mAry17[step];
							okey=eAry17[step];
							
							pkey=mAry17[step];
						}
						
					}, 500);
				}
			}
			else
			{
				beep();
			}
		
	}
	if(slideIndex==17)
		{
			
			curkey=inputkey;
			okey=eAry18[step];
			
			let inchar = okey.substr(index, 1);
			console.log(okey+":"+index+":"+inchar+":"+inputkey);
			if(inchar=="" || index>=okey.length) 
			{
				step++;
						
				index=0;
				intext="|";
				finishkey="";
				inkey="";
				keystep=0;
				return;
			}
			
			if(inputkey==inchar)
			{
				inkey +=inchar;
				 var jbSplit = fAry18[step].split(' ');
				 intext=jbSplit[index];
				
				
				
				if(intext==mAry18[step] || index >=okey.length-1)
				{
						step++;
						
						index=0;
						
						inkey="";
						keystep=0;
						
						
					
				}
				else
				{
						index++;
				}
				
				
				if(index==0 && step>0)
				{
					setTimeout(function () {
						
							
							intext="|";
							inkey="";
							finishkey="";
							keystep=0;
						if(step==mAry18.length)
						{
							bFinish=true;
							step=0;
							bNextenable=true;
							var f = document.getElementsByClassName("bottomTxt");
								for (i = 0; i < f.length; i++) {
										
										f[i].style.cssText  ="align-items:center; visibility:block; justify-content: center; display: block; display: flex;flex-direction: row; align-items: right;width:100%;	height:auto;-ms-flex-align: center;   -webkit-align-items: center;";
								}
							
							
						}
						else
						{
							qtext=mAry18[step];
							okey=eAry18[step];
							
							pkey=mAry18[step];
						}
						
					}, 500);
				}
			}
			else
			{
				beep();
			}
		
	}
	
	if(slideIndex==20)
		{
			console.log(inputkey);
			if(inputkey=="n")
			{
				
				intext="၏";
				slideIndex=19;
				showDivs(slideIndex);
				
				bNextenable=true;
				var f = document.getElementsByClassName("bottomTxt");
								for (i = 0; i < f.length; i++) {
										
										f[i].style.cssText  ="align-items:center; visibility:block; justify-content: center; display: block; display: flex;flex-direction: row; align-items: right;width:100%;	height:auto;-ms-flex-align: center;   -webkit-align-items: center;";
								}
			}
			else
			{
				beep();
			}
		
	}
	if(slideIndex==21 )
		{
			
			curkey=inputkey;
			
			okey=eAry21[step];
			
			
			
			
			let inchar=okey.substr(index+qin, 1);
		
			console.log(okey+":"+index+":"+inchar+":"+inputkey);
			if(inchar=="" || index+qin>=okey.length) 
			{
				step++;
						
				index=0;
				intext="|";
				finishkey="";
				inkey="";
				keystep=0;
				return;
			}
			
			if(inputkey==inchar )
			{
				if(pop)
				{
					
					pop=false;
				}
				if(inputkey=="p")
				{
					pop=true;
					qin++;
					
					return;
				}
				
				let n=0;
				if(inputkey==inchar) n=0;
				else if(inputkey==inchar2) n=1;
				inkey +=inchar;
				 var jbSplit = fAry21[step].split(' ');
				 intext=jbSplit[index];
				
				
				
				if(intext==mAry21[step] || index+qin >=okey.length-1)
				{
						step++;
						qin=0;
						index=0;
						
						inkey="";
						keystep=0;
						
						score +=Math.floor((300-pos)/10);
						hratio =(hratio+ (score*100)/25)/2;
						pos=25.0;
					
				}
				else
				{
						index++;
				}
				
				
				if(index==0 && step>0)
				{
					setTimeout(function () {
						
							
							
							intext="|";
							inkey="";
							finishkey="";
							keystep=0;
						if(step==mAry21.length)
						{
							qin=0;
							bFinish=true;
							step=0;
							slideIndex++;
							showDivs(slideIndex);
							bNextenable=true;
								var f = document.getElementsByClassName("bottomTxt");
								for (i = 0; i < f.length; i++) {
										
										f[i].style.cssText  ="align-items:center; visibility:block; justify-content: center; display: block; display: flex;flex-direction: row; align-items: right;width:100%;	height:auto;-ms-flex-align: center;   -webkit-align-items: center;";
								}
							
						}
						else
						{
							qtext=mAry21[step];
							okey=eAry21[step];
							
							pkey=mAry21[step];
						}
						
					}, 500);
				}
			}
			else
			{
				beep();
			}
		
	}
		if(slideIndex==23 )
		{
			if(!bStart) return;
			curkey=inputkey;
			var okeySplit=eAry23[sNumbers[step]-1].split('/');
			var okey2="";
			var inchar2="";
			okey=okeySplit[0];
			
			if(okeySplit.length==2)
			{
				okey2=okeySplit[1];
				inchar2=okey2.substr(index, 1);
			}
			
			let inchar=okey.substr(index+qin, 1);
			
			
			
			console.log(okey+":"+index+":"+inchar+":"+inputkey);
			if(inchar=="" || index>=okey.length) 
			{
				step++;
						
				index=0;
				intext="|";
				finishkey="";
				inkey="";
				keystep=0;
				return;
			}
			
			if(inputkey==inchar || inputkey==inchar2)
			{
				if(pop)
				{
					
					pop=false;
				}
				if(inputkey=="p")
				{
					qin++;
					pop=true;
					
					
					okey=eAry23[sNumbers[step]-1];
					prekey=okey.substr(index+qin, 1);
					console.log("prekey1:"+prekey);
					
					
					return;
				}
				else
				{
					prekey=okey.substr(index+qin, 1);
					console.log("prekey1:"+prekey);
					pop=false;
				}
				let n=0;
				if(inputkey==inchar) n=0;
				else if(inputkey==inchar2) n=1;
				inkey +=inchar;
				var fsplit=fAry23[sNumbers[step]-1].split('/');
				 var jbSplit = fsplit[n].split(' ');
				 intext=jbSplit[index];
				
				
				
				if(intext==mAry23[sNumbers[step]-1] || index+qin >=okey.length-1)
				{
						step++;
						qin=0;
						index=0;
						
						inkey="";
						keystep=0;
						
						score +=Math.floor((300-pos)/10);
						hratio =(hratio+ (score*100)/25)/2;
						pos=25.0;
					
				}
				else
				{
						index++;
				}
				
				
				if(index==0 && step>0)
				{
					setTimeout(function () {
						
							
							
							intext="|";
							inkey="";
							finishkey="";
							keystep=0;
						if(step==sNumbers.length)
						{
							bFinish=true;
							step=0;
							slideIndex++;
							showDivs(slideIndex);
							//end();
							 var endTime = Date.now();
							  var timeDiff = endTime - startTime; //in ms
							  // strip the ms
							  timeDiff /= 1000.0;
								console.log("st:"+startTime+" "+"et:"+endTime);
							  // get seconds 
							  seconds = timeDiff.toFixed(2);//Math.round(timeDiff);
							
						}
						else
						{
							okey=eAry23[sNumbers[step]-1];
							
							pkey=mAry23[sNumbers[step]-1];
							prekey=okey.substr(index+qin, 1);
							console.log("prekey2:"+prekey);
						}
						
					}, 500);
				}
			}
			else
			{
				beep();
			}
		
	}
	
		
	
	}
	function drawhit(id)
	{
		
		var x,y;
		var w=80;
		var h=80;
		var wd=79;
		var hd=82;
		var yp=196;
		var wd2=80;
		var wd3=79; 
		switch(id)
		{
			case "p": 
			btn.src="./buttons/q.png";
			x=145-wd; y=yp;
			break;
			case "w": 
			btn.src="./buttons/w.png";
			x=145; y=yp;
			break;
			case "e":
			btn.src="./buttons/e.png";
			x=145+(wd); y=yp;
			break;
			case "r":
			btn.src="./buttons/r.png";
			x=145+(wd*2); y=yp;
			break;
			case "t":
			btn.src="./buttons/t.png";
			x=145+(wd*3); y=yp;
			break;
			case "y":
			btn.src="./buttons/y.png";
			x=145+(wd*4); y=yp;
			break;
			case "u":
			btn.src="./buttons/u.png";
			x=145+(wd*5); y=yp;
			break;
			case "a":
			btn.src="./buttons/a.png";
			x=164-wd3; y=yp+(hd);
			break;
			case "s":
			btn.src="./buttons/s.png";
			x=164; y=yp+(hd);
			break;
			case "d":
			btn.src="./buttons/d.png";
			x=164+wd3; y=yp+(hd);
			break;
			case "f":
			btn.src="./buttons/f.png";
			x=164+(wd3*2); y=yp+(hd);
			break;
			case "g":
			btn.src="./buttons/g.png";
			x=164+(wd3*3); y=yp+(hd);
			break;
			case "h":
			btn.src="./buttons/h.png";
			x=164+(wd3*4); y=yp+(hd);
			break;
			case "z":
			btn.src="./buttons/z.png";
			x=200-wd; y=yp+(hd*2);
			break;
			case "x":
			btn.src="./buttons/x.png";
			x=200; y=yp+(hd*2);
			break;
			case "c":
			btn.src="./buttons/c.png";
			x=200+(wd2); y=yp+(hd*2);
			break;
			case "v":
			btn.src="./buttons/v.png";
			x=200+(wd2*2); y=yp+(hd*2);
			break;
			case "b":
			btn.src="./buttons/b.png";
			x=200+(wd2*3); y=yp+(hd*2);
			break;
			case "n":
			btn.src="./buttons/n.png";
			x=200+(wd*4); y=yp+(hd*2);
			break;
			case "i":
			btn.src="./buttons/i.png";
			x=147+(wd*6); y=yp;
			break;
			case "o":
			btn.src="./buttons/o.png";
			x=147+(wd*7); y=yp;
			break;
			case "p":
			btn.src="./buttons/p.png";
			x=147+(wd*8); y=yp;
			break;
			case "j":
			btn.src="./buttons/j.png";
			x=165+(wd3*5); y=yp+(hd);
			break;
			case "k":
			btn.src="./buttons/k.png";
			x=166+(wd3*6); y=yp+(hd);
			break;
			case "l":
			btn.src="./buttons/l.png";
			x=167+(wd3*7); y=yp+(hd);
			break;
			case "m":
			btn.src="./buttons/m.png";
			x=200+(wd2*5); y=yp+(hd*2);
			case ",":
			
			x=200+(wd*6); y=yp+(hd*2);
			break;
			case ".":
			
			x=200+(wd*7); y=yp+(hd*2);
			break;
			break;
		}
		
		btn.onload=function(){
				ctx.drawImage (btn,x,y,w,h);
		}
		ctx.drawImage (btn,x,y,w,h);
	}
	function drawhit2(id)
	{
		
		var x,y;
		var w=65;
		var h=65;
		var wd=56;
		var hd=56;
		var yp=305;
		var wd2=56;
		var wd3=56; 
		switch(id)
		{
			case "q": 
			btn.src="./buttons/q.png";
			x=228-wd; y=yp;
			break;
			case "w": 
			btn.src="./buttons/w.png";
			x=228; y=yp;
			break;
			case "e":
			btn.src="./buttons/e.png";
			x=228+(wd); y=yp;
			break;
			case "r":
			btn.src="./buttons/r.png";
			x=228+(wd*2); y=yp;
			break;
			case "t":
			btn.src="./buttons/t.png";
			x=228+(wd*3); y=yp;
			break;
			case "y":
			btn.src="./buttons/y.png";
			x=228+(wd*4); y=yp;
			break;
			case "u":
			btn.src="./buttons/u.png";
			x=228+(wd*5); y=yp;
			break;
			case "a":
			btn.src="./buttons/a.png";
			x=242-wd3; y=yp+(hd);
			break;
			case "s":
			btn.src="./buttons/s.png";
			x=242; y=yp+(hd);
			break;
			case "d":
			btn.src="./buttons/d.png";
			x=242+wd3; y=yp+(hd);
			break;
			case "f":
			btn.src="./buttons/f.png";
			x=242+(wd3*2); y=yp+(hd);
			break;
			case "g":
			btn.src="./buttons/g.png";
			x=242+(wd3*3); y=yp+(hd);
			break;
			case "h":
			btn.src="./buttons/h.png";
			x=242+(wd3*4); y=yp+(hd);
			break;
			case "z":
			btn.src="./buttons/z.png";
			x=266-wd; y=yp+(hd*2)+2;
			break;
			case "x":
			btn.src="./buttons/x.png";
			x=266; y=yp+(hd*2)+2;
			break;
			case "c":
			btn.src="./buttons/c.png";
			x=266+(wd2); y=yp+(hd*2)+2;
			break;
			case "v":
			btn.src="./buttons/v.png";
			x=266+(wd2*2); y=yp+(hd*2)+2;
			break;
			case "b":
			btn.src="./buttons/b.png";
			x=266+(wd2*3); y=yp+(hd*2)+2;
			break;
			case "n":
			btn.src="./buttons/n.png";
			x=266+(wd*4); y=yp+(hd*2)+2;
			break;
			case "i":
			btn.src="./buttons/i.png";
			x=228+(wd*6); y=yp;
			break;
			case "o":
			btn.src="./buttons/o.png";
			x=228+(wd*7); y=yp;
			break;
			case "p":
			btn.src="./buttons/p.png";
			x=228+(wd*8); y=yp;
			break;
			case "j":
			btn.src="./buttons/j.png";
			x=242+(wd3*5); y=yp+(hd);
			break;
			case "k":
			btn.src="./buttons/k.png";
			x=242+(wd3*6); y=yp+(hd);
			break;
			case "l":
			btn.src="./buttons/l.png";
			x=242+(wd3*7); y=yp+(hd);
			break;
			case "m":
			btn.src="./buttons/m.png";
			x=266+(wd2*5); y=yp+(hd*2)+2;
			break;
			case ",":
			
			x=266+(wd*6); y=yp+(hd*2)+2;
			break;
			case ".":
			
			x=266+(wd*7); y=yp+(hd*2)+2;
			break;
		}
		
		btn.onload=function(){
				ctx.drawImage (btn,x,y,w,h);
			}
			ctx.drawImage (btn,x,y,w,h);		
		
		
		
	}
	var count=0;
	var panicnt=0;
	var pfcnt=0;
	var hanicnt=0;
	var hfcnt=0;
	function drawprekey(id)
	{
		
		var x,y;
		var w=65;
		var h=65;
		var wd=70;
		var hd=70;
		var yp=220;
		var wd2=56;
		var wd3=56; 

		switch(id)
		{
			case "q": 
			
			x=175-wd; y=yp;
			break;
			case "w": 
			
			x=175; y=yp;
			break;
			case "e":
			
			x=175+(wd); y=yp;
			break;
			case "r":
			
			x=175+(wd*2); y=yp;
			break;
			case "t":
			
			x=175+(wd*3); y=yp;
			break;
			case "y":
			
			x=175+(wd*4); y=yp;
			break;
			case "u":
			
			x=175+(wd*5); y=yp;
			break;
			case "a":
			
			x=190-wd; y=yp+(hd);
			break;
			case "s":
			
			x=190; y=yp+(hd);
			break;
			case "d":
			
			x=190+wd; y=yp+(hd);
			break;
			case "f":
			
			x=190+(wd*2); y=yp+(hd);
			break;
			case "g":
			
			x=190+(wd*3); y=yp+(hd);
			break;
			case "h":
			
			x=190+(wd*4); y=yp+(hd);
			break;
			case "z":
			
			x=222-wd; y=yp+(hd*2)+2;
			break;
			case "x":
			
			x=222; y=yp+(hd*2)+2;
			break;
			case "c":
			
			x=222+(wd); y=yp+(hd*2)+2;
			break;
			case "v":
			
			x=222+(wd*2); y=yp+(hd*2)+2;
			break;
			case "b":
			
			x=222+(wd*3); y=yp+(hd*2)+2;
			break;
			case "n":
			
			x=222+(wd*4); y=yp+(hd*2)+2;
			break;
			case "i":
			
			x=175+(wd*6); y=yp;
			break;
			case "o":
			
			x=175+(wd*7); y=yp;
			break;
			case "p":
			
			x=175+(wd*8); y=yp;
			break;
			case "j":
			
			x=190+(wd*5); y=yp+(hd);
			break;
			case "k":
			
			x=190+(wd*6); y=yp+(hd);
			break;
			case "l":
			
			x=190+(wd*7); y=yp+(hd);
			break;
			case ";":
			
			x=190+(wd*8); y=yp+(hd);
			break;
			case "m":
			
			x=222+(wd*5); y=yp+(hd*2)+2;
			break;
			case ",":
			
			x=222+(wd*6); y=yp+(hd*2)+2;
			break;
			case ".":
			
			x=222+(wd*7); y=yp+(hd*2)+2;
			break;
			default:
			return;			
		}
		
			
		if(panicnt>5)
		{
			panicnt=0;
			pfcnt++;
		}
							if(pfcnt>=up_imageUrls.length) 
							{
								if(!bStart)
								{
									pfcnt=0;
								}
								else
								{
									
									
									if(pfcnt-up_imageUrls.length>=dn_imageUrls.length)
									{
										bmiss=false;
										curkey="";
										if(step==gNumbers.length)
										{
											setTimeout(function () {
											
											bFinish=true;
											
											slideIndex++;
											showDivs(slideIndex);
											},2000);
											
										}
										else
										{
											
											pfcnt=0;
											step++;
											if(step<gNumbers.length)
											pong.play();
											if(slideIndex==5)
											{
												prekey=gAry[gNumbers[step]-1];
												if(prekey==oldkey)
												{
													prekey=gAry[0];
												}
											}
											if(slideIndex==6)
											{
												prekey=gAry2[gNumbers[step]-1];
												if(prekey==oldkey)
												{
													prekey=gAry2[0];
												}
											}
											if(slideIndex==7)
											{
												prekey=gAry3[gNumbers[step]-1];
												if(prekey==oldkey)
												{
													prekey=gAry3[0];
												}
											}
										
											oldkey=prekey;
											return;
										}
									}
									
									
									drawgif( 1, pfcnt-up_imageUrls.length, x, y);
								}
							
							}
							else
							{
								if(!bStart)
								{
									drawgif( 0, pfcnt, 720, 360);
								}
								else
								{
									
									drawgif( 0, pfcnt, x, y);
								}
								
							}
						
	}
	
	function drawhitkey(id)
	{
		
		var x,y;
		var w=65;
		var h=65;
		var wd=70;
		var hd=70;
		var yp=220;
		var wd2=56;
		var wd3=56; 

		switch(id)
		{
			case "q": 
			
			x=175-wd; y=yp;
			break;
			case "w": 
			
			x=175; y=yp;
			break;
			case "e":
			
			x=175+(wd); y=yp;
			break;
			case "r":
			
			x=175+(wd*2); y=yp;
			break;
			case "t":
			
			x=175+(wd*3); y=yp;
			break;
			case "y":
			
			x=175+(wd*4); y=yp;
			break;
			case "u":
			
			x=175+(wd*5); y=yp;
			break;
			case "a":
			
			x=190-wd; y=yp+(hd);
			break;
			case "s":
			
			x=190; y=yp+(hd);
			break;
			case "d":
			
			x=190+wd; y=yp+(hd);
			break;
			case "f":
			
			x=190+(wd*2); y=yp+(hd);
			break;
			case "g":
			
			x=190+(wd*3); y=yp+(hd);
			break;
			case "h":
			
			x=190+(wd*4); y=yp+(hd);
			break;
			case "z":
			
			x=222-wd; y=yp+(hd*2)+2;
			break;
			case "x":
			
			x=222; y=yp+(hd*2)+2;
			break;
			case "c":
			
			x=222+(wd); y=yp+(hd*2)+2;
			break;
			case "v":
			
			x=222+(wd*2); y=yp+(hd*2)+2;
			break;
			case "b":
			
			x=222+(wd*3); y=yp+(hd*2)+2;
			break;
			case "n":
			
			x=222+(wd*4); y=yp+(hd*2)+2;
			break;
			case "i":
			
			x=175+(wd*6); y=yp;
			break;
			case "o":
			
			x=175+(wd*7); y=yp;
			break;
			case "p":
			
			x=175+(wd*8); y=yp;
			break;
			case "j":
			
			x=190+(wd*5); y=yp+(hd);
			break;
			case "k":
			
			x=190+(wd*6); y=yp+(hd);
			break;
			case "l":
			
			x=190+(wd*7); y=yp+(hd);
			break;
			case ";":
			
			x=190+(wd*8); y=yp+(hd);
			break;
			case "m":
			
			x=222+(wd*5); y=yp+(hd*2)+2;
			break;
			case ",":
			
			x=222+(wd*6); y=yp+(hd*2)+2;
			break;
			case ".":
			
			x=222+(wd*7); y=yp+(hd*2)+2;
			break;
		}
		
			
			if(hanicnt>5)
			{
				hanicnt=0;
				hfcnt++;

			}
			if(prekey==curkey)
			{
				
				bmiss=false;
				if(hfcnt>=hit_imageUrls.length)
				{
					curkey="";
					if(step==gNumbers.length)
					{
						setTimeout(function () {
						
						bFinish=true;
						
						slideIndex++;
						showDivs(slideIndex);
						},2000);
						
					}
					else
					{
						
					curkey="";
					bhit=false;
					hfcnt=0;
					pfcnt=0;
					panicnt=0;
					hanicnt=0;
					
					}
					
				}
				drawgif( 2, hfcnt, x+7, y-15);
			}
			else 
			{
				bhit=false;
				
				if(hfcnt>=nohit_imageUrls.length) 
				{
					curkey="";
					
					hfcnt=0;
					
					hanicnt=0;
					bmiss=false;
				}
				drawgif( 3, hfcnt, x, y);
			}
	}
	
	function blink()
	{
		setTimeout(function () {
			if(slideIndex==7 || slideIndex==8 || slideIndex==9 || slideIndex==15 || slideIndex==16 || slideIndex>=23) 
			{	
				
						
			}
			blink();
					}, 1000);
		
		
	}
	function draw() {
		bDraw=true;
		ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
		//context.clearRect(0, 0, context.canvas.width, context.canvas.height);
		//console.log(canvas.width+":"+canvas.height);
		//ctx.fillStyle = "white";
		//ctx.fillRect(0," 0, ctx.canvas.width, ctx.canvas.height);
		var gap=0;
		var textWidth=0;
		var textWidth2=0;
		var textString="";
		var textString2="";
		switch(slideIndex)
		{
			
			case 5:
			case 6:	
			case 7:		
						ctx.fillStyle = "rgb(248,248,248)";
						ctx.fillRect(0,0,ctx.canvas.width, ctx.canvas.height); 
					
					
					
						
						ctx.font = "25px Arial";
						ctx.fillStyle = "rgb(79,85,67)";
						ctx.fillText("Prog: "+(step+1)+"/"+sNumbers.length , 100, 70);
						ctx.fillText("Whack: "+(hit) , 100, 100);
						ctx.fillText("Missed: "+(step-hit) , 100, 130);
						ctx.fillText("Swing: "+miss , 100, 160);
						kimg5.onload=function(){
						ctx.drawImage (kimg5,200,30,kimg5.width*0.7,kimg5.height*0.7);
							}
						ctx.drawImage (kimg5,200,30,kimg5.width*0.7,kimg5.height*0.7);
						//if(slideIndex==5)
						gimg2.src = "./sub/5p_main.png" ;
						/*if(slideIndex==6 || slideIndex==7)
						gimg2.src = "./sub/6p_main.png" ;*/
						gimg2.onload=function(){
							ctx.drawImage (gimg2,0,190,gimg2.width*0.7,gimg2.height*0.7);
							if(count<=150)
							{
								if(slideIndex==5) 
								{
									kimg5lev1.onload=function(){
										ctx.drawImage (kimg5lev1,340,285,kimg5lev1.width*0.7,kimg5lev1.height*0.7);
									}
										ctx.drawImage (kimg5lev1,340,285,kimg5lev1.width*0.7,kimg5lev1.height*0.7);
								}
								if(slideIndex==6) 
								{
									kimg6lev2.onload=function(){
										ctx.drawImage (kimg6lev2,340,285,kimg6lev2.width*0.7,kimg6lev2.height*0.7);
									}
										ctx.drawImage (kimg6lev2,340,285,kimg6lev2.width*0.7,kimg6lev2.height*0.7);
								}
								if(slideIndex==7) 
								{
									kimg7lev3.onload=function(){
										ctx.drawImage (kimg7lev3,340,285,kimg7lev3.width*0.7,kimg7lev3.height*0.7);
									}
										ctx.drawImage (kimg7lev3,340,285,kimg7lev3.width*0.7,kimg7lev3.height*0.7);
								}
							}
							if(slideIndex==7)
							{
								kimg5suc.onload=function(){
								ctx.drawImage (kimg5suc,350,285,kimg5suc.width*0.7,kimg5suc.height*0.7);
							}
								ctx.drawImage (kimg5suc,350,285,kimg5suc.width*0.7,kimg5suc.height*0.7);
							}
						}
						ctx.drawImage (gimg2,0,190,gimg2.width*0.7,gimg2.height*0.7);
						
						if(slideIndex==5 && count<=100) 
						ctx.drawImage (kimg5lev1,340,285,kimg5lev1.width*0.7,kimg5lev1.height*0.7);
						if(slideIndex==6 && count<=100)
						ctx.drawImage (kimg6lev2,340,285,kimg6lev2.width*0.7,kimg6lev2.height*0.7);
						if(slideIndex==7 && count<=100)
						ctx.drawImage (kimg7lev3,340,285,kimg7lev3.width*0.7,kimg7lev3.height*0.7);
						
						if(count<=150){
								bStart=false;
									}
						else if(count==151 )
						{
							bStart=true;
							
							pong.play();
							if(slideIndex==5)
							prekey=gAry[gNumbers[step]-1];
							if(slideIndex==6)
							prekey=gAry2[gNumbers[step]-1];
							if(slideIndex==7)
							prekey=gAry3[gNumbers[step]-1];
						}
								
						
						if(bStart && (slideIndex==5 || slideIndex==6 || slideIndex==7))
						{
							//console.log("prekey,step:"+prekey+":"+step);
							if(step==gNumbers.length)
							{
								
								bStart=false;
								setTimeout(function () {
									if(slideIndex<7)
									{
										slideIndex++;
										showDivs(slideIndex);
									}
									else
									{
										
										if(slideIndex==7 )
										{
											ctx.drawImage (kimg5suc,350,285,kimg5suc.width*0.7,kimg5suc.height*0.7);
											var f = document.getElementsByClassName("bottomTxt");
											for (i = 0; i < f.length; i++) {
											bNextenable=true;
											f[i].style.cssText  = "align-items:center; visibility:visible; justify-content: center; display: block; display: flex;flex-direction: row; align-items: right;width:100%;	height:auto;-ms-flex-align: center;   -webkit-align-items: center;";	
											}
										}
									}
								
								}, 1000);
								
								
							}
							else
							{
								//if(slideIndex==7) 
								if(step<gNumbers.length)
								{
									
									drawprekey(prekey);
								}
								if(bmiss)
								{
									drawprekey(prekey);
									drawhitkey(curkey);
								}
								else if(curkey.length>0)
								{
									if(bhit)
									{
										
										drawhitkey(curkey);
										
									}
									else 
									{
										drawprekey(prekey);
									}
								}
								else
								drawprekey(prekey);
							}
						}
						
						
				
			break;
			
			
			case 13:	
				
			case 16:
				
			case 17:
				
			case 18:
			
			case 19:
				
			case 20:
			case 21:
				if(slideIndex==13)
				{
					
					kimg.src = "./sub/13p_main.png" ;
					textString ="အခြေခံ ဗျည်းကို လေ့ကျင့်ကြည့်ပါ။";
					ctx.font = "25px Arial";
					ctx.fillStyle = "black";
					textWidth = ctx.measureText(textString ).width;
					ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 60);
				}
				if(slideIndex==16)
				{
					
					kimg.src = "./sub/16p_main.png" ;
					textString ="လေ ခလုတ် နှင့် လှိုင်းခလုတ်ကို အသုံးပြုပြီး အောက်ပါ ဗျည်းကို ရေးကျင့်ကြည့်ပါ။";
					ctx.font = "25px Arial";
					ctx.fillStyle = "black";
					textWidth = ctx.measureText(textString ).width;
					ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 60);
				}
				if(slideIndex==18)
				{
					kimg.src = "./sub/17p_main.png" ;
					textString ="အခြားအက္ခရာများ၏ အစီအစဉ်မှာ အောက်ပါအတိုင်း ဖြစ်ပါသည်။";
					textString2 ="စက်ကပ်ရိုက်နည်းဖြင့် ရွေးချယ်ပြီး ရိုက်ပါ။";
					ctx.font = "25px Arial";
					ctx.fillStyle = "black";
					textWidth = ctx.measureText(textString ).width;
					textWidth2 = ctx.measureText(textString2 ).width;
					ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 40);
					ctx.fillText(textString2 , (canvas.width/2) - (textWidth2 / 2), 80);
				}
				if(slideIndex==17)
				{
					kimg.src = "./sub/18p_main.png" ;
					textString ="အသံတွဲများကို ပေါင်းစပ်သည့် လမ်းညွှန်အတိုင်း ရိုက်ပါ။";
					textString2 ="စက်ကပ်ရိုက်နည်းဖြင့် ရွေးချယ်ပြီး ရိုက်ပါ။";
					ctx.font = "25px Arial";
					ctx.fillStyle = "black";
					textWidth = ctx.measureText(textString ).width;
					textWidth2 = ctx.measureText(textString2 ).width;
					ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 40);
					ctx.fillText(textString2 , (canvas.width/2) - (textWidth2 / 2), 80);
					
				}
				if(slideIndex==19)
				{
					kimg.src = "./sub/19p_main.png" ;
					
					textString ="သီးသန့်သရ၊ သီးသန့်အက္ခရာ၊ သရသွပ် ရိုက်နည်း";
					textString2 ="+key ကိုနှိပ်ကြည့်ပါ။";
					ctx.font = "25px Arial";
					ctx.fillStyle = "black";
					textWidth = ctx.measureText(textString ).width;
					textWidth2 = ctx.measureText(textString2 ).width;
					ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 40);
					ctx.fillText(textString2 , (canvas.width/2) - (textWidth2 / 2), 80);
				}
				if(slideIndex==20)
				{
					kimg.src = "./sub/20p_popup.png" ;
					/*textString ="ဒီ အနီရောင် အက္ခရာများကို ဒီ စာမျက်နှာ မလိုအပ်ဘဲ တိုက်ရိုက် ရိုက်နှိပ်နိုင်ပါတယ်။  ";
					
					ctx.font = "25px Arial";
					ctx.fillStyle = "black";
					textWidth = ctx.measureText(textString ).width;
					ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 60);*/
					textString ="သီးသန့်သရ၊ သီးသန့်အက္ခရာ၊ သရသွပ် ရိုက်နည်း";
					textString2 ="+key ကိုနှိပ်ကြည့်ပါ။";
					ctx.font = "25px Arial";
					ctx.fillStyle = "black";
					textWidth = ctx.measureText(textString ).width;
					textWidth2 = ctx.measureText(textString2 ).width;
					ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 40);
					ctx.fillText(textString2 , (canvas.width/2) - (textWidth2 / 2), 80);
				}
				if(slideIndex==21)
				{
					kimg.src = "./sub/21p_main.png" ;
					textString ="ယခု လက်နှစ်ဖက်လုံး တပြိုင်နက် လေ့ကျင့်ကြမယ်။";
					textString2 ="အောက်ပါ အက္ခရာကို ရိုက်နှိပ်ကြည့်ပါ။"; 
					ctx.font = "25px Arial";
					ctx.fillStyle = "black";
					textWidth = ctx.measureText(textString ).width;
					textWidth2 = ctx.measureText(textString2 ).width;
					ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 40);
					ctx.fillText(textString2 , (canvas.width/2) - (textWidth2 / 2), 80);
				}
				
				ctx.font = "30px Arial";
				ctx.fillText("ရိုက်ထည့်ရန် :", 50, 150-gap);
				ctx.font = "40px Arial";
				ctx.fillText(qtext, 220, 150-gap);
				
				ctx.beginPath();
				ctx.lineWidth = "1";
				ctx.strokeStyle = "black";
				ctx.roundRect(380, 100-gap, 240, 80, [10, 0, 10, 0]);
				ctx.stroke();
				if(slideIndex==13)
				{
					kimg.onload=function(){
					ctx.drawImage (kimg,0,190-gap,kimg.width*0.71,kimg.height*0.71);
					}
					ctx.drawImage (kimg,0,190-gap,kimg.width*0.71,kimg.height*0.71);
				}
				else
				{
					kimg.onload=function(){
					ctx.drawImage (kimg,-60,190-gap,kimg.width*0.71,kimg.height*0.71);
					}
					ctx.drawImage (kimg,-60,190-gap,kimg.width*0.71,kimg.height*0.71);
				}
				if(pop)
				{
					pimg.onload=function(){
					ctx.drawImage (pimg,-60,190-gap,pimg.width*0.72,pimg.height*0.72);
					}
					ctx.drawImage (pimg,-60,190-gap,pimg.width*0.72,pimg.height*0.72);
				}
				ctx.font = "40px Arial";
				
				if(count>20)
				{
					count=0;
					if(intext=="") intext="|";
					else if(intext=="|") intext="";
					curkey="";
					
					
				}
				
				if(intext=="|")
				ctx.fillText(intext, 480, 145-gap);
				else 
				{
					textWidth = ctx.measureText(intext ).width;
					ctx.fillText(intext , 480 - (textWidth / 2), 147-gap);
					//ctx.fillText(intext, 470-(intext.length-1)*27, 147-gap);
				}
				//drawhit(curkey);
			break;
			case 23:
			
					
					if(bStart)
					{
						pos+=dy;
					
						if(pos>ctx.canvas.height-230)
						{
							pos-=dy;
							/*step++;
							pos=10.0;
							index=0;
							intext="|";
							finishkey="";
							inkey="";
							keystep=0;*/
						}
					}
					
						kimg3.onload=function(){
						ctx.drawImage (kimg3,0,0,kimg3.width*0.7,kimg3.height*0.7);
						}
					
						ctx.drawImage (kimg3,0,0,kimg3.width*0.7,kimg3.height*0.7);
						
					
					if(!bStart)
					{
						ctx.font = "25px Arial";
						ctx.fillStyle = "rgb(79,85,67)";
						var textString="နောက်ဆုံး အဆင့်ကို ရောက်ရှိလာခဲ့ပါပြီ။";
						var textWidth = ctx.measureText(textString ).width;
						ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 70);
						 textString="ထွက်ပေါ်လာသော အက္ခရာများကို မြေပြင်ပေါ် မကျခင်";
						 textWidth = ctx.measureText(textString ).width;
						ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 110);
						 textString="အမှီ ရိုက်နှိပ်ကြည့်ပါ။";
						 textWidth = ctx.measureText(textString ).width;
						ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 150);
						var f = document.getElementsByClassName("bottomTxt");
						for (i = 0; i < f.length; i++) {
								
								f[i].style.cssText  = "align-items:center; visibility:visible; justify-content: center; display: block; display: flex;flex-direction: row; align-items: right;width:100%;	height:auto;-ms-flex-align: center;   -webkit-align-items: center;";	
							
						}
						
					}
					else
					{
						if(pop)
						{
							pimg.onload=function(){
							ctx.drawImage (pimg,95,310,pimg.width*0.55,pimg.height*0.5);
							}
							ctx.drawImage (pimg,95,310,pimg.width*0.55,pimg.height*0.5);
						}
						ctx.font = "30px Arial";
						ctx.fillStyle = "black";
						if(mAry23[sNumbers[step]-1] !=null)
						{
							var textString=mAry23[sNumbers[step]-1];
							var textWidth = ctx.measureText(textString ).width;
							ctx.fillText(mAry23[sNumbers[step]-1] , (canvas.width/2) - (textWidth / 2), pos);
						
						}
						
						
					
						ctx.font = "30px Arial";
						ctx.fillStyle = "rgb(79,85,67)";
						
						if(count>20)
						{
							curkey="";
							count=0;
							if(intext=="") intext="|";
							else if(intext=="|") intext="";
						}
						
						textWidth = ctx.measureText(intext ).width;
						ctx.fillText(intext, (canvas.width/2) - (textWidth / 2), 300);
						
						
						//drawScore();
						//drawhit2(prekey);
						//drawhit2(curkey);
						
						setTimeout(function () {
							
								
								
							if(step==sNumbers.length)
							{
								
								okey=eAry23[sNumbers[step]-1];
								
								pkey=mAry23[sNumbers[step]-1];
								intext="|";
								inkey="";
								finishkey="";
								keystep=0;
								bFinish=true;
								step=0;
								
								slideIndex=24;

								showDivs(slideIndex);
								
								/*
								//end();
								 var endTime = Date.now();
								  var timeDiff = endTime - startTime; //in ms
								  // strip the ms
								  timeDiff /= 1000.0;
									console.log("st:"+startTime+" "+"et:"+endTime);
								  // get seconds 
								  seconds = timeDiff.toFixed(2);//Math.round(timeDiff);
								
								console.log("res:"+result);*/
							}
							
						}, 1000);
					}
				break;
			case 24:
						kimg4.onload=function(){
						ctx.drawImage (kimg4,0,0,kimg4.width*0.7,kimg4.height*0.7);
						}
					
						ctx.drawImage (kimg4,0,0,kimg4.width*0.7,kimg4.height*0.7);
						ctx.font = "25px Arial";
						ctx.fillStyle = "rgb(79,85,67)";
						var textString="ဂုဏ်ယူပါတယ်။";
						var textWidth = ctx.measureText(textString ).width;
						ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 230);
						 textString="သင်ဟာ အခုဆိုရင် မြန်မာ ကီးဘုတ်ကို မကြည့်ဘဲ ရိုက်နှိပ်နိုင်ခဲ့ပါပြီ။";
						 textWidth = ctx.measureText(textString ).width;
						ctx.fillText(textString , (canvas.width/2) - (textWidth / 2), 260);
						
				break;
		
	}
	if(slideIndex==5 || slideIndex==6 || slideIndex==7 || slideIndex==13 || (slideIndex>=16 && slideIndex<=21) || slideIndex==23 || slideIndex==24)
		{
			
			count++;
			panicnt++;
			hanicnt++;
			
			requestAnimationFrame(draw);
		}
		else 
		{
			bDraw=false;
		}
		
		
}
function plusDivs(n) {
  showDivs(slideIndex += n);
  
}

function showDivs(n) {
	var i;
	console.log(n);
	pop=false;
	qin=0;
	if(n ==19)
	{
		if(intext =="၏")
		{
			
		}
		else
		intext="|";
	}
	else
	{
		intext="|";
	}
	inkey="";
	finishkey="";
	keystep=0;
	index=0;
	step=0;
	bOn1=false;
	bOn2=false;
	bStart=false;
	gStart=false;
	
	if(n==5 || n==6 || n==7)
	{
	
		miss=0;
		hit=0;
		step=0;
		count=0;
		bStart=false;
		if(n==5)
		gNumbers = pickRandomNumbers(gAry.length,  60);
		if(n==6)
		gNumbers = pickRandomNumbers(gAry2.length,  60);
		if(n==7)
		gNumbers = pickRandomNumbers(gAry3.length,  60);
		
			if(!bDraw)
			draw();
		
	}
	if(n==13 )
	{
		count=0;
		step=0;
		sNumbers = pickRandomNumbers(mAry13.length, 10);
		pkey=mAry13[step];
		okey=eAry13[step];
		
		console.log("okey:"+okey);
		if(!bDraw)
		draw();
	}
	if(n==16 )
	{
		count=0;
		step=0;
		sNumbers = pickRandomNumbers(mAry16.length, 10);
		pkey=mAry16[step];
		okey=eAry16[step];
		
		console.log("okey:"+okey);
		if(!bDraw)
		draw();
	}
	if(n==17 )
	{
		count=0;
		step=0;
		sNumbers = pickRandomNumbers(mAry18.length, mAry18.length-1);
		pkey=mAry18[step];
		okey=eAry18[step];
		
		console.log("okey:"+okey);
		if(!bDraw)
		draw();
	}
	if(n==18 )
	{
		count=0;
		step=0;
		sNumbers = pickRandomNumbers(mAry17.length, mAry17.length-1);
		pkey=mAry17[sNumbers[0]];
		okey=eAry17[sNumbers[0]];
		console.log("okey:"+okey);
		if(!bDraw)
		draw();
	}
	if(n==19 )
	{
		console.log("intext:"+intext);
		count=0;
		step=0;
		/*sNumbers = pickRandomNumbers(mAry19.length, 10);
		pkey=mAry19[sNumbers[0]];
		okey=eAry19[sNumbers[0]];
		console.log("okey:"+okey);*/
		if(!bDraw)
		draw();
	}
	if(n==20 )
	{
		console.log("intext:"+intext);
		count=0;
		step=0;
		/*sNumbers = pickRandomNumbers(mAry19.length, 10);
		pkey=mAry19[sNumbers[0]];
		okey=eAry19[sNumbers[0]];
		console.log("okey:"+okey);*/
		if(!bDraw)
		draw();
	}
	if(n==21 )
	{
		count=0;
		step=0;
		sNumbers = pickRandomNumbers(mAry21.length, 10);
		pkey=mAry21[step];
		okey=eAry21[step];
		
		console.log("okey:"+okey);
		if(!bDraw)
		draw();
	}
	if(n==23 )
	{
		count=0;
		step=0;
		sNumbers = pickRandomNumbers(mAry23.length, 30);
		pkey=mAry23[sNumbers[step]-1];
		okey=eAry23[sNumbers[step]-1];
		
		console.log("okey:"+okey);
		if(!bDraw)
		draw();
	}
	
	pos=0;
	
		
	
  var x = document.getElementsByClassName("swiper-slide");
  
  if (n > x.length) {slideIndex = 1}
  if (n < 1) {slideIndex = x.length} ;
  for (i = 0; i < x.length; i++) {
    x[i].style.display = "none";
	
  }
  slideIndex=n;
  
	if(slideIndex==25)
	{
		x[slideIndex-1].style.display = "block";
	}	
  else if(slideIndex==5 || slideIndex==6 || slideIndex==7 || slideIndex==13 ||  (slideIndex>=16 && slideIndex<=21) || slideIndex==23 || slideIndex==24)
  {
	  bFinish=false;
	  bStart=false;
	  if(n==13) 
		{
		step=0;
		qtext=mAry13[step];
		
		}
		if(n==16) 
		{
		step=0;
		qtext=mAry16[step];
		}
		if(n==17) 
		{
		step=0;
		qtext=mAry18[step];
		}
		if(n==18) 
		{
		step=0;
		qtext=mAry17[step];
		}
		if(n==19) 
		{
		step=0;
		qtext="၏";
		}
		if(n==20) 
		{
		step=0;
		qtext=": ၏";
		}
		if(n==21) 
		{
		step=0;
		qtext=mAry21[step];
		}
		if(n==23) 
		{
		step=0;
		index=0;
		qtext=mAry23[sNumbers[step]-1];
		prekey=okey.substr(index, 1);
		console.log("prekey:"+prekey);
		}
	  
	 
	  x[4].style.display = "block";
	  
  }
  else
  {
	 
	x[slideIndex-1].style.display = "block";
	 
  }
  if(slideIndex==1) 
  {
	 document.getElementById('stitle').innerHTML ="HOME";
	
	 bFinish=false;
  }
  
	else if(slideIndex>=2 && slideIndex<=7)  
	 document.getElementById('stitle').innerHTML ="၁။ ကီးဘုတ် ဂိမ်းဆော့ကြမယ် ";

	else if(slideIndex>=8 && slideIndex<=16) 
	 document.getElementById('stitle').innerHTML ="၂။ ဘယ်လက်ဖြင့် အရင်လေ့ကျင့်မယ်။";

	else if(slideIndex>=17 && slideIndex<=20) 
	{
		
		document.getElementById('stitle').innerHTML ="၃။ ညာလက်ဖြင့် လေ့ကျင့်မယ်။";
	}
	else if(slideIndex>=21 && slideIndex<=22) 
	{
		
		document.getElementById('stitle').innerHTML ="၄။ လက်နှစ်ဖက်လုံး တပြိုင်နက် လေ့ကျင့်မယ်။";
	}
	else if(slideIndex>=23 && slideIndex<=24) 
	{
		
		document.getElementById('stitle').innerHTML ="၅။ ကီးဘုတ်ကို မကြည့်ဘဲ ရိုက်နှိပ်ကြည့်ရအောင်။";
	}
	
		
	var f = document.getElementsByClassName("bottomTxt");
	for (i = 0; i < f.length; i++) {
		if((slideIndex>0 && slideIndex<=4) || (slideIndex>7 && slideIndex<=12) || (slideIndex>=14 && slideIndex<=15) || slideIndex==22 || slideIndex==25 )
		{
			
			bNextenable=true;
			f[i].style.cssText  = "align-items:center; visibility:visible; justify-content: center; display: block; display: flex;flex-direction: row; align-items: right;width:100%;	height:auto;-ms-flex-align: center;   -webkit-align-items: center;";	
			
		}
		else
		{
			bNextenable=false;
			f[i].style.cssText  = "align-items:center; visibility:hidden; justify-content: center; display: block; display: flex;flex-direction: row; align-items: right;width:100%;	height:auto;-ms-flex-align: center;   -webkit-align-items: center;";
		}
		
	} 
/*	bDraw=false;
	setTimeout(() => {   
			
			if(!bDraw)
			draw();
			}, 200 );
	dn=false;
	*/
}
function zoomIn(event) {
      event.target.style.transform = "scale(2.0)"; //1.2배 확대
      event.target.style.zIndex = 1;
      event.target.style.transition = "all 0.5s";// 속도
    }
  
function zoomOut(event) {
  event.target.style.transform = "scale(1)";
  event.target.style.zIndex = 0;
  event.target.style.transition = "all 0.5s";
}


showDivs(slideIndex);