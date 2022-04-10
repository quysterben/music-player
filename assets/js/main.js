const $ = document.querySelector.bind(document);
const $$ = document.querySelectorAll.bind(document);

const PLAYER_STORAGE = 'PLAYER';

const cdElement = $('.cd');
const heading = $('header h2');
const cdThumb = $('.cd-thumb');
const audio = $('#audio');
const player = $('.player');
const progress = $('.progress');
const playlist = $('.playlist');

const playBtn = $('.btn.btn-toggle-play');
const nextBtn = $('.btn.btn-next');
const prevBtn = $('.btn.btn-prev');
const randomBtn = $('.btn.btn-random');
const repeatBtn = $('.btn.btn-repeat');

const app = {
    currentIndex: 0,
    isPlaying: false,
    isRandom: false,
    isRepeat: false,
    _this: this,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE)) || {},
    songs: [
        {
            name: 'Anhs & Ems',
            singer: 'QNT x RZMAS x WXRDIE',
            path: './assets/music/song1.mp3',
            image: './assets/img/song1.jpg'
        },
        {
            name: '好きだから',
            singer: '『ユイカ』',
            path: './assets/music/song2.mp3',
            image: './assets/img/song2.jpg'
        },
        {
            name: '168 Giờ',
            singer: 'Khải',
            path: './assets/music/song3.mp3',
            image: './assets/img/song3.jpg'
        },
        {
            name: 'Kẻ cô đơn trong thành phố',
            singer: 'Khải',
            path: './assets/music/song4.mp3',
            image: './assets/img/song4.jpg'
        },
        {
            name: '自惚れ',
            singer: 'まつり',
            path: './assets/music/song5.mp3',
            image: './assets/img/song5.jpg'
        },
        {
            name: '嫌いになれない',
            singer: 'れん',
            path: './assets/music/song6.mp3',
            image: './assets/img/song6.jpg'
        },
    ],
    defineProperties: function() {
        Object.defineProperty(this, 'currentSong', {
            get: function() {
                return this.songs[this.currentIndex];
            }
        })
    },
    setConfig: function(key, value) {
        this.config[key] = value;
        localStorage.setItem(PLAYER_STORAGE, JSON.stringify(this.config));
    },
    loadConfig: function() {
        this.isRandom = this.config.isRandom;
        this.isRepeat = this.config.isRepeat;
        repeatBtn.classList.toggle('active', this.isRepeat);
        randomBtn.classList.toggle('active', this.isRandom);
    },
    render: function() {
        const htmls = this.songs.map((song, index) => {
            return `<div class="song ${index === this.currentIndex ? 'active' : ''}" data-index = ${index}>
                <div class="thumb" style="background-image: url('${song.image}')">
                </div>
                <div class="body">
                    <h3 class="title">${song.name}</h3>
                    <p class="author">${song.singer}</p>
                </div>
                <div class="option">
                    <i class="fas fa-ellipsis-h"></i>
                </div>
            </div>`;
        })

        playlist.innerHTML = htmls.join('');
    },
    handleEvent: function() {
        const _this = this;
        const cdWidth = cdElement.offsetWidth;
        
        // handle CD zoom in / out
        document.onscroll = function() {
            const scrollTop = window.scrollY || document.documentElement.scrollTop;
            const newCDWidth = cdWidth - scrollTop;
            cdElement.style.width = newCDWidth > 0 ? newCDWidth + 'px' : 0;
            cdElement.style.opacity = newCDWidth / cdWidth;
        }

        // handle Click Play Button
        playBtn.onclick = function() {            
            if (_this.isPlaying) {
                audio.pause();  
            } else {
                audio.play();
            }
        }

        // handle when Playing Audio
        audio.onplay = function() {
            _this.isPlaying = true;
            player.classList.add('playing');
            cdThumbAnimate.play();
        }

        // handle when pause audio
        audio.onpause = function() {
            _this.isPlaying = false;
            player.classList.remove('playing');
            cdThumbAnimate.pause();
        }

        // handle audio time update
        audio.ontimeupdate = function() {
            if (audio.duration) {
                let progressPercent = audio.currentTime / audio.duration * 100;
                progress.value = progressPercent;
            }
        }

        // handle changing song time
        progress.onchange = function() {
            let newSongTime = progress.value / 100 * audio.duration;
            audio.currentTime = newSongTime;
        }

        // handle CD Thumb Rotate when playing
        const cdThumbAnimate = cdThumb.animate([
            { transform: 'rotate(360deg)'}
        ], {
            duration: 10000,
            iterations: Infinity
        })
        cdThumbAnimate.pause();

        // handle next song
        nextBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.nextSong();
            }
            _this.loadCurrentSong();
            audio.play();
            _this.render();
        }

        // handle prev song
        prevBtn.onclick = function() {
            if (_this.isRandom) {
                _this.playRandomSong();
            } else {
                _this.prevSong();    
            }
            _this.loadCurrentSong();
            audio.play();
            _this.render();
        }

        // handle random button
        randomBtn.onclick = function() {
            _this.isRandom = !_this.isRandom;
            randomBtn.classList.toggle('active', _this.isRandom);
            _this.setConfig('isRandom', _this.isRandom);
        }

        // handle reapet button
        repeatBtn.onclick = function() {
            _this.isRepeat = !_this.isRepeat;
            repeatBtn.classList.toggle('active', _this.isRepeat);
            _this.setConfig('isRepeat', _this.isRepeat);
        }

        // handle end Audio
        audio.onended = function() {
            if (_this.isRepeat) {
                _this.loadCurrentSong();
                audio.play();
            } else {
                nextBtn.click();
            }
        }

        // handle song click
        playlist.onclick = function(e) {

            if (e.target.closest('.song:not(.active)') 
                && !e.target.closest('.option')) {
                    if (e.target.closest('.option')) {
                        // Song Option
                    } else {
                        const newSongIndex = e.target.closest('.song').dataset.index;
                        _this.currentIndex = Number(newSongIndex);
                        _this.loadCurrentSong();
                        _this.render();
                        audio.play();
                    }
            }
        }
    },
    nextSong: function() {
        this.currentIndex++;
        if (this.currentIndex >= this.songs.length) {
            this.currentIndex = 0;
        }
    },
    prevSong: function() {
        this.currentIndex--;
        if (this.currentIndex < 0) {
            this.currentIndex = this.songs.length - 1;
        }
    },
    playRandomSong: function() {
        let randomNum;
        do {
            randomNum = Math.floor(Math.random() 
            * (this.songs.length - 1));
        } while (randomNum === this.currentIndex);
        this.currentIndex = randomNum;
    },
    loadCurrentSong: function() {
        heading.textContent = this.currentSong.name;
        cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`;
        audio.src = this.currentSong.path;
    },
    start: function() {
        this.defineProperties();
        this.setConfig();
        this.loadConfig();
        this.handleEvent();
        this.loadCurrentSong();
        this.render();
    },
}

app.start();