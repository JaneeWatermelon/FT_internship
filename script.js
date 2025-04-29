window.onload = function() {
   console.log("страница загружена");
   $(".preload").fadeOut("slow");
}


let dices = [];
let pictures = {};

for (let i = 1; i <= 15; i++) {
   pictures[`pictures/pic (${i}).png`] = 2;
}

let current_dice = "";
let can_click = true;
let step_count = 0;
let solved_pairs = 0;
let need_to_start_timer = true;
let how_much_dices;
let already_added = 0;

function ChooseCountOfDices() {
   $("#text").html(`Выберите количество карточек для игры:`);
   $("#modal").css({
      fontSize: '300%',
   })
   let outer_cards = $("<div></div>");
   outer_cards.addClass("outer_cards");
   for(let i = 2; i < 31; i += 2) {
      let butka = $("<button></button>").addClass("btn btn-success btn-lg").attr("id", "count");
      butka.append(i);
      butka.on("click", function () {
         CheckCountOfDices(butka);
      });
      outer_cards.append(butka);
   }
   $("#modal").toggleClass("modal--visible");

   $("#modal").append(outer_cards);
}

function CheckCountOfDices(element) {
   how_much_dices = Number(element.html());

   PreparingToPlay();

   FillDices();

   ShuffleDicesPictures();

   AnimateDices();

   RefreshDices();
}

function PreparingToPlay() {
   $(".outer_cards").remove();

   $("#text").html("Подготавливаем поле");
   $("#modal").css({
      backgroundColor: "rgba(72, 89, 109, 1)",
   })
   setTimeout(function () {
      $("#modal").toggleClass("modal--visible");
   }, 3300);
}

function CreateDice() {
   let dice = $("<div></div>");
   dice.addClass("dice");
   return dice;
}

function SetDiceOffset(dice) {
   dice.css({
      left: `${Number(8) + Number(75+7) * (dice.x)}px`,
      top: `${Number(8) + Number(90+8) * (dice.y)}px`,
   })
}

function AppendDice(dice) {
   $("#field").append(dice);
   dices.push(dice);
   console.log("dice pushed");
}

function FillDices() {
   for(let y = 0; y < 5; y++) {
      for(let x = 0; x < 6; x++) {
         if(already_added < how_much_dices) {
            let dice = CreateDice();
            dice.x = x;
            dice.y = y;
            SetDiceOffset(dice);
            AppendDice(dice);
            already_added++;
         }
      }
   }
}

function DiceClick(element) {
   if(element.hasClass("clicked")) {

   } else {
      if(need_to_start_timer == true) {
         TimerStart();
         need_to_start_timer = false;
      }
      if(current_dice == ""){
         ShowDice(element);
         current_dice = element;
         element.children()[0].play();
      } else {
         if(can_click == true) {
            element.children()[0].play();
            step_count++;
            can_click = false;
            ShowDice(element);
            if(current_dice.picture != element.picture) {
               setTimeout(function() {
                  HideDice(element);
                  HideDice(current_dice);
                  current_dice = "";
                  can_click = true;
               }, 800);
            } else {
               current_dice = "";
               solved_pairs++;
               CheckVictory();
               setTimeout(function() {
                  $("#pair")[0].play();
               }, 400);
               setTimeout(function() {
                  can_click = true;
               }, 800);
            } 
         }
      }
   }
}

function AnimateDices() {
   for (let i = 0; i < dices.length; ++i) {
      let aud = $("<audio></audio>");
      aud.attr("src", "music/Effects/click.mp3");
      dices[i].append(aud);
      dices[i].on("click", function (event) {
         DiceClick(dices[i]);
      });
   }
}

function HideDice(element) {
   element.removeClass("clicked");
   element.css({
      transform: "scaleX(0)",
   })
   setTimeout(function() {
      element.css({
         transform: "scale(0.9)",
         background: '',
         transform: '',
         boxShadow: '',
      });
   }, 200);
}

function ShowDice(element) {
   element.addClass("clicked");
   element.css({
      transform: "scaleX(0)",
   })
   setTimeout(function() {
      element.css({
         transform: "scale(0.9)",
         background: `url("${element.picture}")`,
         backgroundSize: "cover",
         backgroundPosition: "center",
         boxShadow: "0 0 0 0",
      });
   }, 200);
}

function ShuffleDicesPictures() {
   let keys = Object.keys(pictures).splice(0, how_much_dices/2);
   for(let i = 0; i < dices.length; i++) {
      let is_continue = true;
      while(is_continue) {
         let element = dices[i];
         let random_key = keys[Math.floor(Math.random()*keys.length)];
         if(pictures[random_key] > 0) {
            element.picture = random_key;
            --pictures[random_key];
            is_continue = false;
         }
      }
   }
   
}

function CheckVictory() {
   if (solved_pairs == how_much_dices/2) {
      TimerEnd();

      $("#text").html(`Победа!\nКоличество ходов: ${step_count}`);
      $("#modal").css({
         fontSize: '',
         backgroundColor: '',
      })
      $("#modal").toggleClass("modal--visible");

      let btn = $("<button></button>").addClass("btn btn-success btn-lg").attr("id", "restart");
      btn.on("click", function () {
         location.reload();
      });
      btn.append("Сыграть ещё раз");

      $("#modal").append(btn);
   }
}

function RefreshDices() {
   for(let i = 0; i < dices.length; i++) {
      ShowDice(dices[i]);
      setTimeout(function() {
         HideDice(dices[i]);
      }, 3000);
   }
}

$("#music_on").on("click", function(){
   MusicClick();
});

$("#music_off").on("click", function(){
   MusicClick();
});

$("#music_off").toggleClass("actived");

function MusicClick() {
   $("#music_on").toggleClass("actived");
   $("#music_off").toggleClass("actived");
   if($("#music_on").hasClass("actived")) {
      $("#music")[0].play();
   } else {
      $("#music")[0].pause();
   }
}

let seconds = 0;
let minutes = 0;
let hours = 0;
let timer_id;

let timer = $("#timer");

function updateTime() {
    seconds++;
    if (seconds === 60) {
        minutes++;
        seconds = 0;
    }
    if (minutes === 60) {
        hours++;
        minutes = 0;
    }
    timer.html(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
}

function TimerStart() {
   timer_id = setInterval(updateTime, 1000);
   timer.css({
       color: "red"
   });
   setTimeout(function () {
       timer.css({
           color: "white"
       });
   }, 1000);
}

function TimerEnd() {
   clearInterval(timer_id);
   timer.css({
       color: "black"
   })
}

ChooseCountOfDices();