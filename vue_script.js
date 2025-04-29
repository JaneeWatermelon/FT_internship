const { createApp, ref, computed, onMounted } = Vue;

createApp({
    setup() {
        // Состояние приложения
        const isLoading = ref(true);
        const modalText = ref('');
        const elapsedTime = ref(0); // в секундах
        const timerInterval = ref(null);

        const timer = $("#timer");

        // Форматированное время для таймера
        const formattedTime = computed(() => {
            const hours = Math.floor(elapsedTime.value / 3600);
            const minutes = Math.floor((elapsedTime.value % 3600) / 60);
            const seconds = elapsedTime.value % 60;

            return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        });

        // Методы
        const toggleMusic = () => {
            $("#music_on").toggleClass("actived");
            $("#music_off").toggleClass("actived");
            if ($("#music_on").hasClass("actived")) {
                $('#music')[0].play();
            } else {
                $('#music')[0].pause();
            }
        };

        $("#music_on, #music_off").on("click", function () {
            toggleMusic();
        });

        const changeMessage = (message) => {
            modalText.value = message;
        };
        const toggleModal = () => {
            $("#modal").toggleClass("modal--visible");
        };

        const startTimer = () => {
            if (timerInterval.value) clearInterval(timerInterval.value);
            timerInterval.value = setInterval(() => {
                elapsedTime.value++;
            }, 1000);
        };
        const endTimer = () => {
            clearInterval(timerInterval.value);
            timer.css({
                color: "black"
            })
        };

        const dices = ref([]);
        let pictures = {};

        for (let i = 1; i <= 15; i++) {
            pictures[`pictures/pic (${i}).png`] = 2;
        }

        let current_dice = '';
        let can_click = true;
        let step_count = 0;
        let solved_pairs = 0;
        let need_to_start_timer = true;
        let max_dices_count;

        function ChooseCountOfDices() {
            changeMessage("Выберите количество карточек для игры:");
            $("#modal").css({
                fontSize: '300%',
            })
            let outer_cards = $("<div></div>");
            outer_cards.addClass("outer_cards");
            for (let i = 2; i < 31; i += 2) {
                let butka = $("<button></button>").addClass("btn btn-success btn-lg").attr("id", "count");
                butka.append(i);
                butka.on("click", function () {
                    CheckCountOfDices(butka);
                });
                outer_cards.append(butka);
            }
            toggleModal();

            $("#modal").append(outer_cards);
        }

        function CheckCountOfDices(element) {
            max_dices_count = Number(element.html());

            PreparingToPlay();

            FillDices();

            ShuffleDicesPictures();

            setDiceClickEventHandler();

            RefreshDices();
        }

        function PreparingToPlay() {
            $(".outer_cards").remove();

            changeMessage("Подготавливаем поле");
            $("#modal").css({
                backgroundColor: "rgba(72, 89, 109, 1)",
            })
            setTimeout(function () {
                toggleModal();
            }, 3300);
        }

        function CreateDice() {
            return {
                element: $("<div></div>").addClass("dice"),
                picture: '',
                isClicked: false,
                isSolved: false
            };
        }

        function FillDices() {
            dices.value = []; // Очищаем массив
            for (let i = 0; i < max_dices_count; i++) {
                const dice = CreateDice();
                dices.value.push(dice);
                $("#field > .dices_wrapper").append(dice.element);
            }
        }

        const playClickSound = () => {
            const audio = document.getElementById('diceClickAudio');
            audio.currentTime = 0;
            audio.play().catch(e => console.log("Audio play error:", e));
        };

        function DiceClickVue(dice) {
            if (!dice.isSolved) {
                if (need_to_start_timer == true) {
                    startTimer();
                    need_to_start_timer = false;
                }
                if (current_dice == '') {
                    ShowDice(dice);
                    current_dice = dice;
                    playClickSound();
                } else {
                    if (can_click) {
                        playClickSound();
                        step_count++;
                        can_click = false;
                        ShowDice(dice);
                        if (current_dice.picture != dice.picture) {
                            setTimeout(function () {
                                HideDice(dice);
                                HideDice(current_dice);
                                current_dice = '';
                                can_click = true;
                            }, 800);
                        } else {
                            current_dice.isSolved = true;
                            dice.isSolved = true;
                            current_dice = '';
                            solved_pairs++;
                            CheckVictory();
                            setTimeout(function () {
                                $("#pair")[0].play();
                            }, 400);
                            setTimeout(function () {
                                can_click = true;
                            }, 800);
                        }
                    }
                }
            }
        }

        function setDiceClickEventHandler() {
            dices.value.forEach(dice => {
                $(dice.element).off('click').on('click', () => {
                    DiceClickVue(dice);
                });
            });
        }

        function HideDice(dice) {
            changeDiceIsClicked(dice, false);
            dice.element.css({
                transform: "scaleX(0)",
            })
            setTimeout(function () {
                dice.element.css({
                    transform: "scale(0.9)",
                    background: '',
                    transform: '',
                    boxShadow: '',
                });
            }, 200);
        }

        function changeDiceIsClicked(dice, bool) {
            if (bool) {
                dice.isClicked = true;
                dice.element.addClass("clicked");
            }
            else {
                dice.isClicked = false;
                dice.element.removeClass("clicked");
            }
        }

        function ShowDice(dice) {
            const element = $(dice.element);
            changeDiceIsClicked(dice, true);
            element.css({
                transform: "scaleX(0)"
            });

            setTimeout(function () {
                element.css({
                    transform: "scale(0.9)",
                    background: dice.picture ? `url("${dice.picture}")` : '',
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    boxShadow: "0 0 0 0",
                });
            }, 200);
        }

        function ShuffleDicesPictures() {
            let keys = Object.keys(pictures).splice(0, max_dices_count / 2);

            for (let i = 0; i < dices.value.length; i++) {
                let is_continue = true;
                while (is_continue) {
                    let random_key = keys[Math.floor(Math.random() * keys.length)];
                    if (pictures[random_key] > 0) {
                        dices.value[i].picture = random_key;
                        --pictures[random_key];
                        is_continue = false;
                    }
                }
            }
        }

        function CheckVictory() {
            if (solved_pairs == max_dices_count / 2) {
                endTimer();

                changeMessage(`Победа!\nКоличество ходов: ${step_count}`);
                $("#modal").css({
                    fontSize: '',
                    backgroundColor: '',
                })
                toggleModal();
                $("#restart").removeClass("d_none");
            }
        }

        function RefreshDices() {
            for (let i = 0; i < dices.value.length; i++) {
                const dice = dices.value[i]
                ShowDice(dice);
                setTimeout(function () {
                    HideDice(dice);
                }, 3000);
            }
        }




        // Хуки жизненного цикла
        onMounted(() => {
            $("#restart").addClass("d_none");
            $("#music_off").addClass("actived");
            ChooseCountOfDices();

            setTimeout(function () {
                isLoading.value = false;
            }, 2000);
        });

        return {
            isLoading,
            modalText,
            formattedTime,
            toggleMusic,
            reloadPage: function () { location.reload(); },
        };
    }
}).mount('#app');